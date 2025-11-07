import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";

async function getDailyProblem(userId: string) {
  const solvedProblems = await prisma.problemSolution.findMany({
    where: { userId, status: "Solved" },
    select: { problemId: true },
  });
  const solvedProblemIds = solvedProblems.map((p) => p.problemId);
  const unsolvedProblemsCount = await prisma.problem.count({
    where: { id: { notIn: solvedProblemIds } },
  });

  if (unsolvedProblemsCount > 0) {
    const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
    return prisma.problem.findFirst({
      where: { id: { notIn: solvedProblemIds } },
      skip: randomSkip,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        topic: true,
        maxTime: true,
      },
    });
  }
  return null;
}

async function getInProgressProjects(userId: string) {
  const startedProjectsProgress = await prisma.projectProgress.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          domain: true,
          maxTime: true,
          coverImage: true,
        },
      },
    },
  });

  const submittedProjectIds = new Set(
    (
      await prisma.submittedProjects.findMany({
        where: { userId },
        select: { projectId: true },
      })
    ).map((p) => p.projectId)
  );

  return startedProjectsProgress
    .filter((progress) => !submittedProjectIds.has(progress.projectId))
    .map((progress) => ({
      ...progress.project,
      startedAt: progress.startedAt.toISOString(),
    }));
}

async function getLeaderboardData(userId: string) {
  const weekStartDate = getWeekStartDateUTC();

  const userProfileWithGroup = await prisma.profiles.findUnique({
    where: { id: userId },
    select: {
      currentGroup: {
        select: {
          id: true,
          league: true,
          weekStartDate: true,
          members: {
            select: { id: true, name: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });

  const group = userProfileWithGroup?.currentGroup;

  if (!group || group.weekStartDate.getTime() !== weekStartDate.getTime()) {
    return { league: null, leaderboard: [] };
  }

  const members = group.members;
  if (members.length === 0) {
    return { league: group.league, leaderboard: [] };
  }

  const memberIds = members.map((member) => member.id);
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

  const leaderboardWithScores = members.map((member) => ({
    ...member,
    weeklyXP: scoreMap.get(member.id) || 0,
  }));

  const sortedLeaderboard = leaderboardWithScores.sort(
    (a, b) => b.weeklyXP - a.weeklyXP
  );

  return {
    league: group.league,
    leaderboard: sortedLeaderboard,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dailyProblem, inProgressProjects, leaderboardData] =
      await Promise.all([
        getDailyProblem(user.id),
        getInProgressProjects(user.id),
        getLeaderboardData(user.id),
      ]);

    return NextResponse.json({
      dailyProblem,
      projects: inProgressProjects,
      leaderboard: leaderboardData.leaderboard,
      league: leaderboardData.league,
      currentUserId: user.id,
    });
  } catch (error: unknown) {
    console.error("Error fetching consolidated dashboard data:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}