import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";

const PAGE_SIZE = 12;

const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const getXpForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "Easy":
      return 100;
    case "Medium":
      return 250;
    case "Hard":
      return 500;
    default:
      return 0;
  }
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const difficulty = searchParams.get("difficulty");

  if (page < 1) {
    return NextResponse.json(
      { error: "Page must be a positive number." },
      { status: 400 }
    );
  }

  const skip = (page - 1) * PAGE_SIZE;

  const whereCondition: { difficulty?: Difficulty } = {};

  if (difficulty && VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    whereCondition.difficulty = difficulty as Difficulty;
  }

  try {
    const [problemsData, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
        where: whereCondition,
        skip: skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          difficulty: true,
          acceptanceRate: true,
          tags: true,
          slug: true,
          _count: {
            select: {
              userProgress: {
                where: {
                  userId: user?.id,
                  status: "Solved",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.problem.count({
        where: whereCondition,
      }),
    ]);

    const problems = problemsData.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      acceptanceRate: p.acceptanceRate,
      tags: p.tags,
      xp: getXpForDifficulty(p.difficulty),

      solved: p._count.userProgress > 0,
    }));

    return NextResponse.json({
      problems,
      totalCount,
    });
  } catch (error) {
    console.error("Prisma query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from the database." },
      { status: 500 }
    );
  }
}
