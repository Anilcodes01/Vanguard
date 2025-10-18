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
    const { problemId, code, input, expectedOutput, languageId } = await request.json();

    if (!problemId || code === undefined || input === undefined || !languageId) {
      return NextResponse.json({ message: "Problem ID, code, input, and languageId are required." }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ message: "Problem not found." }, { status: 404 });
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
      return NextResponse.json({ message: "Selected language is not supported for this problem." }, { status: 400 });
    }

    let source_code = code;
    let stdin: string | undefined = undefined;

    if (problem.testStrategy === "DRIVER_CODE") {
      if (!languageDetail.driverCodeTemplate) {
        throw new Error(`Problem ${problemId} is misconfigured for language ${languageDetail.language}: missing driver code template.`);
      }
      source_code = languageDetail.driverCodeTemplate
        .replace("{{USER_CODE}}", code)
        .replace("{{TEST_INPUT}}", input || "");
    } else {
      source_code = code;
      stdin = input || undefined;
    }

    const options = {
      method: "POST",
      url: `${process.env.JUDGE0_API_URL}/submissions`,
      params: { base64_encoded: "false", wait: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
      },
      data: {
        language_id: languageId,
        source_code,
        stdin,
        expected_output: expectedOutput,
      },
    };

    const judgeResponse = await axios.request(options);
    const result: Judge0Submission = judgeResponse.data;

    return NextResponse.json({
      status: result.status.description,
      message: result.message,
      userOutput: result.stdout,
      details: result.stderr || result.compile_output,
      input: input,
      expectedOutput: expectedOutput,
      executionTime: parseFloat(result.time) || 0,
      executionMemory: result.memory || 0,
    });
  } catch (error) {
    let errorMessage = "An unknown error occurred during execution.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Error connecting to execution engine.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage, status: "Error" }, { status: 500 });
  }
}