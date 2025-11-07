import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";
import NodeCache from "node-cache";
import { League } from "@prisma/client";

const cache = new NodeCache();

type InProgressProject = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  startedAt: string;
};

type LeaderboardMember = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  weeklyXP: number;
};

type LeaderboardData = {
  league: League | null;
  leaderboard: LeaderboardMember[];
};

async function getDailyProblem(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `daily-problem-${userId}-${today}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const solvedProblems = await prisma.problemSolution.findMany({
    where: { userId, status: "Solved" },
    select: { problemId: true },
  });
  const solvedProblemIds = solvedProblems.map((p) => p.problemId);
  const unsolvedProblemsCount = await prisma.problem.count({
    where: { id: { notIn: solvedProblemIds } },
  });

  let problem = null;
  if (unsolvedProblemsCount > 0) {
    const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
    problem = await prisma.problem.findFirst({
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

  if (problem) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(24, 0, 0, 0);
    const ttl = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    cache.set(cacheKey, problem, ttl);
  }

  return problem;
}

async function getInProgressProjects(userId: string): Promise<InProgressProject[]> {
  const cacheKey = `in-progress-projects-${userId}`;
  const cachedData = cache.get<InProgressProject[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

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

  const projects = startedProjectsProgress
    .filter((progress) => !submittedProjectIds.has(progress.projectId))
    .map((progress) => ({
      ...progress.project,
      startedAt: progress.startedAt.toISOString(),
    }));

  cache.set(cacheKey, projects, 120);
  return projects;
}

async function getLeaderboardData(userId: string): Promise<LeaderboardData> {
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

  const cacheKey = `leaderboard-${group.id}`;
  const cachedData = cache.get<LeaderboardData>(cacheKey);
  if (cachedData) {
    return cachedData;
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

  const leaderboardData = {
    league: group.league,
    leaderboard: sortedLeaderboard,
  };

  cache.set(cacheKey, leaderboardData, 300);
  return leaderboardData;
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