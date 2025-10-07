import { prisma } from "@/lib/prisma";
import { SubmissionStatus, SolutionStatus } from "@prisma/client";
import axios from "axios";
import { createClient } from '@/app/utils/supabase/server';
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

function mapJudge0StatusToEnum(description: string): SubmissionStatus {
    const mapping: { [key: string]: SubmissionStatus } = {
        "Accepted": SubmissionStatus.Accepted,
        "Wrong Answer": SubmissionStatus.WrongAnswer,
        "Time Limit Exceeded": SubmissionStatus.TimeLimitExceeded,
        "Compilation Error": SubmissionStatus.CompilationError,
        "Runtime Error (NZEC)": SubmissionStatus.RuntimeError,
        "Internal Error": SubmissionStatus.InternalError,
    };
    return mapping[description] || SubmissionStatus.InternalError;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const { problemId, code } = await request.json();
    
    if (!problemId || !code) {
      return NextResponse.json({ message: "Problem ID and code are required." }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return NextResponse.json({ message: "Problem or test cases not found." }, { status: 404 });
    }
    
    let finalResult: Judge0Submission | null = null;
    let allTestsPassed = true;
    let firstFailedTestCase = null;

    for (const testCase of problem.testCases) {
      let source_code = code;
      let stdin: string | undefined = undefined;

      if (problem.testStrategy === 'DRIVER_CODE') {
        if (!problem.driverCodeTemplate) {
          throw new Error(`Problem ${problemId} is misconfigured: missing driver code template.`);
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
          source_code,
          stdin,
          expected_output: testCase.expected,
        },
      };

      const judgeResponse = await axios.request(options);
      const result: Judge0Submission = judgeResponse.data;
      finalResult = result;
      if (result.status.id !== 3) {
        allTestsPassed = false;
        firstFailedTestCase = testCase;
        break; 
      }
    }

    if (!finalResult) {
        throw new Error("Code execution failed to produce a result.");
    }

    const newSubmission = await prisma.submission.create({
        data: {
            userId: user.id,
            problemId: problem.id,
            code: code,
            languageId: problem.languageId,
            status: mapJudge0StatusToEnum(finalResult.status.description),
            executionTime: parseFloat(finalResult.time) || null,
            executionMemory: finalResult.memory || null,
        }
    });

    const existingSolution = await prisma.problemSolution.findUnique({
        where: { userId_problemId: { userId: user.id, problemId: problem.id } }
    });

    if (allTestsPassed) {
        if (!existingSolution) {
            await prisma.problemSolution.create({
                data: {
                    userId: user.id,
                    problemId: problem.id,
                    status: SolutionStatus.Solved,
                    firstSolvedAt: new Date(),
                    lastAttemptedAt: new Date(),
                    bestSubmissionId: newSubmission.id,
                }
            });
        } else if (existingSolution.status !== SolutionStatus.Solved) {
            await prisma.problemSolution.update({
                where: { userId_problemId: { userId: user.id, problemId: problem.id } },
                data: {
                    status: SolutionStatus.Solved,
                    firstSolvedAt: existingSolution.firstSolvedAt || new Date(),
                    lastAttemptedAt: new Date(),
                    bestSubmissionId: newSubmission.id,
                }
            });
        } else {
            await prisma.problemSolution.update({
                where: { userId_problemId: { userId: user.id, problemId: problem.id } },
                data: { lastAttemptedAt: new Date() }
            });
        }
    } else {
        if (!existingSolution) {
            await prisma.problemSolution.create({
                data: {
                    userId: user.id,
                    problemId: problem.id,
                    status: SolutionStatus.Attempted,
                    lastAttemptedAt: new Date(),
                }
            });
        } else {
             await prisma.problemSolution.update({
                where: { userId_problemId: { userId: user.id, problemId: problem.id } },
                data: { lastAttemptedAt: new Date() }
            });
        }
    }
    
    if (allTestsPassed) {
        return NextResponse.json({ status: 'Accepted' });
    } else {
        return NextResponse.json({
            status: finalResult.status.description,
            message: finalResult.message,
            details: finalResult.stderr || finalResult.compile_output,
            input: firstFailedTestCase?.input,
            userOutput: finalResult.stdout,
            expectedOutput: firstFailedTestCase?.expected,
        });
    }

  } catch (error) {
    console.error("Submission failed:", error);
    let errorMessage = "An unknown error occurred during submission.";
    if (axios.isAxiosError(error) && error.response) {
       errorMessage = error.response.data?.message || "Error connecting to execution engine.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage, status: 'Error' }, { status: 500 });
  }
}