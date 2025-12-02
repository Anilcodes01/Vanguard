import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// 1. Language Mapping Helper
// Map your Schema strings to Judge0 IDs (https://ce.judge0.com/)
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  python: 71,     // Python (3.8.1)
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  go: 60,         // Go (1.13.5)
  // Add others as needed
};

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
    // 2. Accept 'language' string instead of ID
    const { problemId, code, input, expectedOutput, language } =
      await request.json();

    if (!problemId || code === undefined || !language) {
      return NextResponse.json(
        { message: "Problem ID, code, and language are required." },
        { status: 400 }
      );
    }

    // 3. Resolve Judge0 ID
    const judge0LanguageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
    if (!judge0LanguageId) {
      return NextResponse.json(
        { message: `Language '${language}' is not supported by the execution engine.` },
        { status: 400 }
      );
    }

    // 4. Verify Problem Exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found." },
        { status: 404 }
      );
    }

    // 5. Verify Language is allowed for this problem
    // Using the new 'codingProblemStarterTemplate' table
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
        { message: "Selected language is not enabled for this problem." },
        { status: 400 }
      );
    }

    // 6. Prepare Source Code
    // Note: Since 'driverCodeTemplate' and 'testStrategy' were removed from the schema,
    // we assume the code passed is fully executable (STDIN/STDOUT).
    // If you plan to support hidden driver code later, you need to add that column back to the DB.
    const source_code = code; 
    const stdin = input || undefined;

    const submissionData = {
      language_id: judge0LanguageId,
      source_code: Buffer.from(source_code).toString("base64"),
      stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
      expected_output: expectedOutput
        ? Buffer.from(expectedOutput).toString("base64")
        : null,
    };

    // 7. Call Judge0
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

    // 8. Decode Output
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
      details: decodedStderr || decodedCompileOutput, // Show errors if any
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