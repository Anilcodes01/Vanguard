import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type Judge0Submission = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, input, expectedOutput, languageId } =
      await request.json();

    if (!problemId || code === undefined || !languageId) {
      return NextResponse.json(
        { message: "Problem ID, code, and languageId are required." },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found." },
        { status: 404 }
      );
    }

    const languageDetail = await prisma.problemLanguageDetails.findUnique({
      where: {
        problemId_languageId: {
          problemId: problemId,
          languageId: languageId,
        },
      },
    });

    if (!languageDetail) {
      return NextResponse.json(
        { message: "Selected language is not supported for this problem." },
        { status: 400 }
      );
    }

    let source_code = code;
    let stdin: string | undefined = undefined;

    if (problem.testStrategy === "DRIVER_CODE") {
      if (!languageDetail.driverCodeTemplate) {
        throw new Error(
          `Problem ${problemId} is misconfigured: missing driver code.`
        );
      }
      source_code = languageDetail.driverCodeTemplate
        .replace("{{USER_CODE}}", code.trim())
        .replace("{{RAW_TEST_INPUT}}", input || "");
    } else {
      source_code = code;
      stdin = input || undefined;
    }

    const submissionData = {
      language_id: languageId,
      source_code: Buffer.from(source_code).toString("base64"),
      stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
      expected_output: expectedOutput
        ? Buffer.from(expectedOutput).toString("base64")
        : null,
    };

    const judgeResponse = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result: Judge0Submission = judgeResponse.data;

    const decodedStdout = result.stdout
      ? Buffer.from(result.stdout, "base64").toString("utf-8")
      : null;
    const decodedStderr = result.stderr
      ? Buffer.from(result.stderr, "base64").toString("utf-8")
      : null;
    const decodedCompileOutput = result.compile_output
      ? Buffer.from(result.compile_output, "base64").toString("utf-8")
      : null;

    return NextResponse.json({
      status: result.status.description,
      message: result.message,
      userOutput: decodedStdout,
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
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage, status: "Error" },
      { status: 500 }
    );
  }
}
