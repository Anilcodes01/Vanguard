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
    const { problemId, code } = await request.json();

    if (!problemId || !code) {
      return NextResponse.json(
        { message: "Problem ID and code are required." },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true }, 
    });

    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return NextResponse.json(
        { message: "Problem or test cases not found." },
        { status: 404 }
      );
    }
    
    for (const testCase of problem.testCases) {
      let source_code = code;
      let stdin: string | undefined = undefined;

      if (problem.testStrategy === 'DRIVER_CODE') {
        if (!problem.driverCodeTemplate) {
            throw new Error(`Problem ${problemId} uses DRIVER_CODE strategy but has no template.`);
        }
        source_code = problem.driverCodeTemplate
          .replace('{{USER_CODE}}', code)
          .replace('{{TEST_INPUT}}', testCase.input || '');
      } else { 
        source_code = code;
        stdin = testCase.input || undefined;
      }

      const options = {
        method: 'POST',
        url: `${process.env.JUDGE0_API_URL}/submissions`,
        params: { base64_encoded: 'false', wait: 'true', fields: '*' },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
        },
        data: {
          language_id: problem.languageId,
          source_code: source_code,
          stdin: stdin,
          expected_output: testCase.expected,
        },
      };

      const judgeResponse = await axios.request(options);
      const result: Judge0Submission = judgeResponse.data;

      if (result.status.id !== 3) {
        return NextResponse.json({
          status: result.status.description,
          input: testCase.input,
          expectedOutput: testCase.expected,
          userOutput: result.stdout,
          errorDetails: result.stderr || result.compile_output || null,
        });
      }
    }

    return NextResponse.json({ status: 'Accepted' });

  }  catch (error) {
    console.error("Failed to fetch problem:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        message: "An error occurred while fetching the problem",
        error: errorMessage, 
      },
      { status: 500 }
    );
  }
}