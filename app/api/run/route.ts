import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
};

type Judge0Submission = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: { id: number; description: string };
};

const safeDecode = (str: string | null) => {
  if (!str) return null;
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch (e) {
    return str;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, input, expectedOutput, language } =
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

    let finalSourceCode = code;

    if (template.driverCode) {
      finalSourceCode = template.driverCode.replace("{{USER_CODE}}", code);

      finalSourceCode = finalSourceCode.replace("{{INPUT}}", input);
    }

    const submissionData = {
      language_id: judge0LanguageId,
      source_code: Buffer.from(finalSourceCode).toString("base64"),
      stdin: input ? Buffer.from(input).toString("base64") : null,
      expected_output: expectedOutput
        ? Buffer.from(expectedOutput).toString("base64")
        : null,
    };

    const judgeResponse = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const result: Judge0Submission = judgeResponse.data;

    const decodedStdout = safeDecode(result.stdout);
    const decodedStderr = safeDecode(result.stderr);
    const decodedCompileOutput = safeDecode(result.compile_output);
    const decodedMessage = safeDecode(result.message);

    const cleanUserOutput = decodedStdout ? decodedStdout.trim() : null;

    return NextResponse.json({
      status: result.status.description,
      message: decodedMessage || result.status.description,
      userOutput: cleanUserOutput,
      details: decodedStderr || decodedCompileOutput,
      input: input,
      expectedOutput: expectedOutput,
      executionTime: parseFloat(result.time) || 0,
      executionMemory: result.memory || 0,
    });
  } catch (error) {
    console.error("--- JUDGE0 EXECUTION FAILED ---", error);
    let errorMessage = "An unknown error occurred during execution.";

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;

      if (error.response?.data) {
        console.error("Judge0 Error Details:", error.response.data);
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage, status: "Error" },
      { status: 500 }
    );
  }
}
