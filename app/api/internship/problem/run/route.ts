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

    const algoData = await prisma.internshipAlgoProblemData.findFirst({
      where: {
        problemId: problemId,
        languageId: languageId,
      },
    });

    if (!algoData) {
      return NextResponse.json(
        { message: "Configuration data not found for this problem." },
        { status: 404 }
      );
    }

    let source_code = code;

    const stdin = input || "";

    if (algoData.testStrategy === "DRIVER_CODE") {
      if (!algoData.driverCodeTemplate) {
        throw new Error("Missing driver code template for this problem.");
      }

      const safeInput = input ? JSON.stringify(input).slice(1, -1) : "";

      source_code = algoData.driverCodeTemplate
        .replace("{{USER_CODE}}", code.trim())
        .replace("{{INPUT_PLACEHOLDER}}", safeInput)
        .replace("{{RAW_TEST_INPUT}}", safeInput);
    } else {
      source_code = code;
    }

    const submissionData = {
      language_id: languageId,
      source_code: Buffer.from(source_code).toString("base64"),
      stdin: Buffer.from(stdin).toString("base64"),
      expected_output: expectedOutput
        ? Buffer.from(expectedOutput).toString("base64")
        : null,
    };

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
  } catch (error: unknown) {
    console.error("JUDGE0 EXECUTION ERROR:", error);

    let message = "Execution Error";
    let details: unknown = undefined;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message;
      details = error.response?.data;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { status: "Error", message, details },
      { status: 500 }
    );
  }
}
