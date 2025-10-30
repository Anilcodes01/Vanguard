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

    if (
      !problemId ||
      code === undefined ||
      input === undefined ||
      !languageId
    ) {
      return NextResponse.json(
        { message: "Problem ID, code, input, and languageId are required." },
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
          `Problem ${problemId} is misconfigured for language ${languageDetail.language}: missing driver code template.`
        );
      }
      source_code = languageDetail.driverCodeTemplate
        .replace("{{USER_CODE}}", code.trim())
        .replace("{{RAW_TEST_INPUT}}", input || "");
    } else {
      source_code = code;
      stdin = input || undefined;
    }

    const submissionData: {
      language_id: number;
      source_code: string;
      stdin?: string;
      expected_output: string | null;
      compiler_options?: string;
    } = {
      language_id: languageId,
      source_code: Buffer.from(source_code).toString("base64"),
      stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
      expected_output: expectedOutput
        ? Buffer.from(expectedOutput).toString("base64")
        : null,
    };

    if (languageId === 94) {
      submissionData.compiler_options =
        Buffer.from("--lib es2020,dom").toString("base64");
    }

    const options = {
      method: "POST",
      url: `${process.env.JUDGE0_API_URL}/submissions`,
      params: { base64_encoded: "true", wait: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
      },
      data: submissionData,
    };

    const judgeResponse = await axios.request(options);
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

    const message = result.message;

    return NextResponse.json({
      status: result.status.description,
      message: message,
      userOutput: decodedStdout,
      details: decodedStderr || decodedCompileOutput,
      input: input,
      expectedOutput: expectedOutput,
      executionTime: parseFloat(result.time) || 0,
      executionMemory: result.memory || 0,
    });
  } catch (error) {
    console.error("--- JUDGE0 EXECUTION FAILED ---");
    let errorMessage = "An unknown error occurred during execution.";
    let errorDetails: unknown = {};
    if (axios.isAxiosError(error)) {
      console.error("Axios error status:", error.response?.status);
      console.error(
        "Axios error data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      errorMessage =
        error.response?.data?.message ||
        "Error connecting to execution engine. Check server logs for details.";
      errorDetails = error.response?.data || {
        info: "No response data from Judge0.",
      };
    } else if (error instanceof Error) {
      console.error("Generic error:", error.message);
      errorMessage = error.message;
    } else {
      console.error("Unknown error type:", error);
    }
    return NextResponse.json(
      { message: errorMessage, status: "Error", details: errorDetails },
      { status: 500 }
    );
  }
}