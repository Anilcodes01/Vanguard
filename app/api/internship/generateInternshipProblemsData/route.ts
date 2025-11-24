import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";

import { TestStrategy } from "@prisma/client";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
};

interface GeneratedExample {
  input: string | number;
  output: string | number;
}

interface GeneratedTestCase {
  input: string | number;
  expected: string | number;
  description?: string;
}

interface GeneratedContent {
  starter_code: string;
  driver_code_template: string;
  examples: GeneratedExample[];
  test_cases: GeneratedTestCase[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemId } = await req.json();

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    const existingData = await prisma.internshipAlgoProblemData.findFirst({
      where: { problemId },
      include: {
        problem: {
          include: {
            internshipAlgoProblemExamplesDatas: true,
            internshipAlgoProblemTestCases: true,
          },
        },
      },
    });

    if (existingData) {
      return NextResponse.json({
        message: "Data retrieved from database",
        data: {
          algoData: existingData,
          examples: existingData.problem.internshipAlgoProblemExamplesDatas,
          testCases: existingData.problem.internshipAlgoProblemTestCases,
        },
      });
    }

    const problem = await prisma.internshipProblem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { preferred_langs: true },
    });

    const preferredLang =
      userProfile?.preferred_langs?.[0]?.toLowerCase() || "javascript";
    const languageId = LANGUAGE_MAP[preferredLang] || 63;

    const prompt = `
      You are a coding platform engine. 
      Generate technical execution data for:
      
      Title: "${problem.title}"
      Description: "${problem.description}"
      Target Language: "${preferredLang}"

      Requirements:
      1. starter_code: The function signature users will write code in.
      2. driver_code_template: Code that imports/calls the user's function and logs output (use a placeholder like {{USER_CODE}}).
      3. examples: 3 input/output pairs for description.
      4. test_cases: 5 hidden test cases.

      Output JSON ONLY:
      {
        "starter_code": "String (escaped)",
        "driver_code_template": "String (escaped)",
        "examples": [
          { "input": "String", "output": "String" }
        ],
        "test_cases": [
          { "input": "String", "expected": "String", "description": "String" }
        ]
      }
    `;

    const aiResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const rawText = aiResponse.text;
    if (!rawText) throw new Error("AI response empty");

    const generated = JSON.parse(rawText) as GeneratedContent;

    const result = await prisma.$transaction(async (tx) => {
      const algoData = await tx.internshipAlgoProblemData.create({
        data: {
          problemId: problemId,
          language: preferredLang,
          languageId: languageId,
          starterCode: generated.starter_code,
          driverCodeTemplate: generated.driver_code_template,
          testStrategy: TestStrategy.DRIVER_CODE,
        },
      });

      if (generated.examples && generated.examples.length > 0) {
        await tx.internshipAlgoProblemExamplesData.createMany({
          data: generated.examples.map((ex) => ({
            problemId: problemId,
            input: String(ex.input),
            output: String(ex.output),
          })),
        });
      }

      if (generated.test_cases && generated.test_cases.length > 0) {
        await tx.internshipAlgoProblemTestCase.createMany({
          data: generated.test_cases.map((tc) => ({
            problemId: problemId,
            input: String(tc.input),
            expected: String(tc.expected),
            description: tc.description || "",
          })),
        });
      }

      return algoData;
    });

    const finalData = await prisma.internshipAlgoProblemData.findFirst({
      where: { id: result.id },
      include: {
        problem: {
          include: {
            internshipAlgoProblemExamplesDatas: true,
            internshipAlgoProblemTestCases: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Data generated and saved",
      data: {
        algoData: finalData,
        examples: finalData?.problem.internshipAlgoProblemExamplesDatas || [],
        testCases: finalData?.problem.internshipAlgoProblemTestCases || [],
      },
    });
  } catch (error: unknown) {
    console.error("Generate Problem Data Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Error" },
      { status: 500 }
    );
  }
}
