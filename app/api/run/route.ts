import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1000;
const DEFAULT_CPU_TIME_LIMIT = 5;

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
};

const safeDecode = (str: string | null) => {
  if (!str) return null;
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch (e) {
    return str;
  }
};

const formatResult = (
  result: any,
  input: string | null,
  expectedOutput: string | null
) => {
  if (!result || !result.status) {
    return {
      status: "Error",
      message: "Execution timed out or failed.",
      userOutput: null,
      details: "The execution engine did not return a status in time.",
      input: input,
      expectedOutput: expectedOutput,
      executionTime: 0,
      executionMemory: 0,
      isAccepted: false,
    };
  }

  const decodedStdout = safeDecode(result.stdout);
  const decodedStderr = safeDecode(result.stderr);
  const decodedCompileOutput = safeDecode(result.compile_output);
  const decodedMessage = safeDecode(result.message);

  const cleanUserOutput = decodedStdout ? decodedStdout.trim() : null;
  const isAccepted = result.status.id === 3;
  const status = result.status.description;

  return {
    status,
    message: decodedMessage || status,
    userOutput: cleanUserOutput,
    details: decodedStderr || decodedCompileOutput,
    input: input,
    expectedOutput: expectedOutput,
    executionTime: parseFloat(result.time) || 0,
    executionMemory: result.memory || 0,
    isAccepted,
  };
};

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, language, input, expectedOutput } =
      await request.json();

    if (!problemId || code === undefined || !language) {
      return NextResponse.json(
        { message: "Problem ID, code, and language are required." },
        { status: 400 }
      );
    }

    const judge0LanguageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
    if (!judge0LanguageId) {
      return NextResponse.json(
        { message: `Language '${language}' is not supported.` },
        { status: 400 }
      );
    }

    const template = await prisma.codingProblemStarterTemplate.findUnique({
      where: {
        problemId_language: {
          problemId: problemId,
          language: language,
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Language not enabled for this problem." },
        { status: 400 }
      );
    }

    const isCustomRun = input !== undefined && input !== null;
    let submissions = [];
    let testCasesMeta: { input: string; expectedOutput: string | null }[] = [];

    if (isCustomRun) {
      let finalSourceCode = code;
      if (template.driverCode) {
        finalSourceCode = template.driverCode.replace("{{USER_CODE}}", code);
        finalSourceCode = finalSourceCode.replace("{{INPUT}}", input);
      }

      submissions.push({
        language_id: judge0LanguageId,
        source_code: Buffer.from(finalSourceCode).toString("base64"),
        stdin: Buffer.from(input).toString("base64"),
        expected_output: expectedOutput
          ? Buffer.from(expectedOutput).toString("base64")
          : null,
        cpu_time_limit: DEFAULT_CPU_TIME_LIMIT,
      });
      testCasesMeta.push({ input, expectedOutput });
    } else {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: { orderBy: { order: "asc" } } },
      });

      if (!problem || !problem.testCases.length) {
        return NextResponse.json(
          { message: "No test cases found for this problem." },
          { status: 404 }
        );
      }

      submissions = problem.testCases.map((tc) => {
        let finalSourceCode = code;
        if (template.driverCode) {
          finalSourceCode = template.driverCode.replace("{{USER_CODE}}", code);
          finalSourceCode = finalSourceCode.replace("{{INPUT}}", tc.input);
        }

        testCasesMeta.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        });

        return {
          language_id: judge0LanguageId,
          source_code: Buffer.from(finalSourceCode).toString("base64"),
          stdin: Buffer.from(tc.input).toString("base64"),
          expected_output: tc.expectedOutput
            ? Buffer.from(tc.expectedOutput).toString("base64")
            : null,
          cpu_time_limit: DEFAULT_CPU_TIME_LIMIT,
        };
      });
    }

    const judgeBaseUrl = process.env.JUDGE0_API_URL;
    const judgeResponse = await axios.post(
      `${judgeBaseUrl}/submissions/batch`,
      { submissions },
      {
        params: { base64_encoded: "true", wait: "true", fields: "*" },
        headers: { "Content-Type": "application/json" },
      }
    );

    let results = judgeResponse.data;

    if (
      results &&
      !Array.isArray(results) &&
      Array.isArray(results.submissions)
    ) {
      results = results.submissions;
    }

    if (Array.isArray(results) && results.length > 0 && !results[0].status) {
      const tokens = results.map((r: any) => r.token).join(",");

      let attempts = 0;
      let isComplete = false;

      while (attempts < MAX_POLL_ATTEMPTS && !isComplete) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        const pollResponse = await axios.get(
          `${judgeBaseUrl}/submissions/batch`,
          {
            params: {
              tokens: tokens,
              base64_encoded: "true",
              fields: "*",
            },
            headers: { "Content-Type": "application/json" },
          }
        );

        const pollData = pollResponse.data;
        results = pollData.submissions || pollData;

        const allFinished = results.every(
          (r: any) => r.status && r.status.id !== 1 && r.status.id !== 2
        );

        if (allFinished) {
          isComplete = true;
        }
      }
    }

    if (!Array.isArray(results)) {
      throw new Error("Invalid response format from execution engine");
    }

    const formattedResults = results.map((res: any, index: number) =>
      formatResult(
        res,
        testCasesMeta[index]?.input || "",
        testCasesMeta[index]?.expectedOutput || null
      )
    );

    if (isCustomRun) {
      return NextResponse.json(formattedResults[0]);
    }

    return NextResponse.json({
      type: "batch",
      results: formattedResults,
    });
  } catch (error) {
    console.error("--- JUDGE0 EXECUTION FAILED ---", error);
    let errorMessage = "An unknown error occurred during execution.";

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage, status: "Error" },
      { status: 500 }
    );
  }
}
