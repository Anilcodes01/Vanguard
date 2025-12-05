import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";
import { CardType } from "@prisma/client";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const CARD_ORDER = [
  "case_study",
  "problem_definition",
  "objective",
  "prerequisites",
  "deliverables",
  "rules",
  "action_plan",
];

const truncate = (str: string, length: number) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

interface GeneratedCard {
  card_type: string;
  title: string;
  content: string | string[] | Record<string, string>;
}

interface GeneratedProject {
  title: string;
  description: string;
  github_link?: string;
  live_link?: string;
}

interface GeneratedData {
  project: GeneratedProject;
  selected_problem_ids: string[];
  walkthrough_cards: GeneratedCard[];
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

    const body = await req.json();
    const { week, topic, projectTitle, projectDescription } = body;
    const weekInt = parseInt(week);

    if (isNaN(weekInt) || !topic) {
      return NextResponse.json(
        { error: "Invalid week number or topic" },
        { status: 400 }
      );
    }

    const existingWeek = await prisma.internshipWeek.findUnique({
      where: {
        userId_weekNumber: {
          userId: user.id,
          weekNumber: weekInt,
        },
      },
      include: {
        projects: true,
        problems: true,
        walkthroughs: true,
      },
    });

    if (
      existingWeek &&
      existingWeek.problems.length > 0 &&
      existingWeek.walkthroughs.length > 0
    ) {
      existingWeek.walkthroughs.sort((a, b) => {
        return CARD_ORDER.indexOf(a.cardType) - CARD_ORDER.indexOf(b.cardType);
      });

      return NextResponse.json({
        message: "Week data already exists",
        data: existingWeek,
      });
    }

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { preferred_langs: true, comfort_level: true, domain: true },
    });

    const stack = userProfile?.preferred_langs?.join(", ") || "Web Development";
    const level = userProfile?.comfort_level || "Intermediate";
    const domain = userProfile?.domain || "Software Engineering";

    const candidateProblems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        tags: true,
      },
      take: 60,
    });

    const problemsForPrompt = candidateProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags.join(", "),
      description: truncate(p.description, 200),
    }));

    const prompt = `
      You are a senior technical mentor. Generate detailed internship content for Week ${weekInt}: "${topic}".
      User Context: Domain: ${domain}, Stack: ${stack}, Level: ${level}.
      
      Project Context:
      Title: "${projectTitle}"
      Description: "${projectDescription}"

      Requirements:
      1. **Project**: Expand the project details.
      2. **Problems**: 
         - I am providing a JSON list of available coding problems below.
         - **SELECT EXACTLY 7 IDs** from this list that are most relevant to the topic "${topic}" and user level "${level}".
         - If no problems perfectly match the topic, select the best logic/algo problems for general practice.
         - Return the IDs in the field "selected_problem_ids".
      3. **Walkthrough Cards**: Generate specific cards with strict types.
      
      AVAILABLE PROBLEMS POOL:
      ${JSON.stringify(problemsForPrompt)}

      Output JSON ONLY. Structure:
      {
        "project": { 
          "title": "String", 
          "description": "String"
        },
        "selected_problem_ids": [
          "uuid-1", "uuid-2", ... // Exactly 7 IDs from the provided pool
        ],
        "walkthrough_cards": [
          { "card_type": "case_study", "title": "Case Study: ...", "content": "String" },
          // ... (other card types)
        ]
      }
    `;

    const aiResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const rawText = aiResponse.text;
    if (!rawText) throw new Error("Empty response from AI");

    const generatedData = JSON.parse(rawText) as GeneratedData;

    const selectedIds = generatedData.selected_problem_ids || [];

    let selectedProblemsData = candidateProblems.filter((p) =>
      selectedIds.includes(p.id)
    );

    if (selectedProblemsData.length < 7) {
      const remainingNeeded = 7 - selectedProblemsData.length;
      const unselected = candidateProblems.filter(
        (p) => !selectedIds.includes(p.id)
      );
      selectedProblemsData = [
        ...selectedProblemsData,
        ...unselected.slice(0, remainingNeeded),
      ];
    }

    selectedProblemsData = selectedProblemsData.slice(0, 7);

    const result = await prisma.$transaction(
      async (tx) => {
        const weekRecord = await tx.internshipWeek.upsert({
          where: {
            userId_weekNumber: { userId: user.id, weekNumber: weekInt },
          },
          update: {},
          create: {
            userId: user.id,
            weekNumber: weekInt,
            title: `Week ${weekInt} - ${topic}`,
            description: `Focus on ${topic}`,
            topics: [topic],
          },
        });

        await tx.internshipProject.deleteMany({
          where: { internshipWeekId: weekRecord.id },
        });
        await tx.internshipProject.create({
          data: {
            internshipWeekId: weekRecord.id,
            title: generatedData.project.title || projectTitle,
            description:
              generatedData.project.description || projectDescription,
            githubLink: generatedData.project.github_link || "",
            liveLink: generatedData.project.live_link || "",
            isCompleted: false,
          },
        });

        await tx.internshipProblem.deleteMany({
          where: { internshipWeekId: weekRecord.id },
        });

        const problemsToInsert = selectedProblemsData.map((p) => ({
          internshipWeekId: weekRecord.id,
          title: p.title,
          description: p.description,
          isCompleted: false,
          originalProblemId: p.id,
        }));

        if (problemsToInsert.length > 0) {
          await tx.internshipProblem.createMany({ data: problemsToInsert });
        }

        await tx.walkthroughCard.deleteMany({
          where: { internshipWeekId: weekRecord.id },
        });

        const cardsToInsert = generatedData.walkthrough_cards.map(
          (card: GeneratedCard) => {
            let contentString = "";
            if (typeof card.content === "string") {
              contentString = card.content;
            } else {
              contentString = JSON.stringify(card.content);
            }

            const validTypes = Object.values(CardType);
            const type = validTypes.includes(card.card_type as CardType)
              ? (card.card_type as CardType)
              : CardType.CASE_STUDY;

            return {
              internshipWeekId: weekRecord.id,
              cardType: type,
              title: card.title,
              content: contentString,
            };
          }
        );

        if (cardsToInsert.length > 0) {
          await tx.walkthroughCard.createMany({ data: cardsToInsert });
        }

        return await tx.internshipWeek.findUnique({
          where: { id: weekRecord.id },
          include: {
            projects: true,
            problems: true,
            walkthroughs: true,
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    if (result && result.walkthroughs) {
      result.walkthroughs.sort((a, b) => {
        const indexA = CARD_ORDER.indexOf(a.cardType);
        const indexB = CARD_ORDER.indexOf(b.cardType);
        const safeIndexA = indexA === -1 ? 999 : indexA;
        const safeIndexB = indexB === -1 ? 999 : indexB;
        return safeIndexA - safeIndexB;
      });
    }

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    console.error("Generate Week Data Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
