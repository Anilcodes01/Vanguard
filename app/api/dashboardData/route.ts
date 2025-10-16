import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const solvedProblems = await prisma.problemSolution.findMany({
      where: { userId: user.id, status: "Solved" },
      select: { problemId: true },
    });
    const solvedProblemIds = solvedProblems.map((p) => p.problemId);
    const unsolvedProblemsCount = await prisma.problem.count({
      where: { id: { notIn: solvedProblemIds } },
    });

    let dailyProblem = null;
    if (unsolvedProblemsCount > 0) {
      const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
      dailyProblem = await prisma.problem.findFirst({
        where: { id: { notIn: solvedProblemIds } },
        skip: randomSkip,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topic: true,
        },
      });
    }

    const weekStartDate = getWeekStartDateUTC();
    let leaderboardData;

    const userProfileWithGroup = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        currentGroup: {
          select: {
            id: true,
            league: true,
            weekStartDate: true,
            members: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
              take: 10,
            },
          },
        },
      },
    });

    const currentGroup = userProfileWithGroup?.currentGroup;

    if (
      !currentGroup ||
      currentGroup.weekStartDate.getTime() !== weekStartDate.getTime()
    ) {
      leaderboardData = {
        group: null,
        currentUserRank: -1,
      };
    } else {
      const memberIds = currentGroup.members.map((member) => member.id);

      const weeklyScores = await prisma.problemSolution.groupBy({
        by: ["userId"],
        where: {
          userId: { in: memberIds },
          status: "Solved",
          firstSolvedAt: { gte: weekStartDate },
        },
        _sum: { xpEarned: true },
      });

      const scoreMap = new Map<string, number>();
      weeklyScores.forEach((score) => {
        scoreMap.set(score.userId, score._sum.xpEarned || 0);
      });

      const membersWithWeeklyXP = currentGroup.members.map((member) => ({
        ...member,
        weeklyXP: scoreMap.get(member.id) || 0,
      }));

      const sortedLeaderboard = membersWithWeeklyXP.sort(
        (a, b) => b.weeklyXP - a.weeklyXP
      );
      const userIndex = sortedLeaderboard.findIndex(
        (member) => member.id === user.id
      );
      const currentUserRank = userIndex !== -1 ? userIndex + 1 : -1;

      leaderboardData = {
        group: {
          ...currentGroup,
          members: sortedLeaderboard,
        },
        currentUserRank: currentUserRank,
      };
    }

    return NextResponse.json({
      userId: user.id,
      dailyProblem,
      leaderboard: leaderboardData,
    });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      {
        message: "Error while fetching leaderboard data",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
