import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Fetches the daily problem for the currently authenticated user.
 */
export async function fetchDashboardData() {
  noStore(); // Ensures this function is not cached and runs on every request
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { dailyProblem: null };
    }

    const solvedProblemIds = (await prisma.problemSolution.findMany({
      where: { userId: user.id, status: "Solved" },
      select: { problemId: true },
    })).map((p) => p.problemId);

    const unsolvedProblemsCount = await prisma.problem.count({
      where: { id: { notIn: solvedProblemIds } },
    });

    if (unsolvedProblemsCount === 0) {
      return { dailyProblem: null };
    }

    const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
    const dailyProblem = await prisma.problem.findFirst({
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

    return { dailyProblem };
  } catch (error) {
    console.error("Database Error (fetchDashboardData):", error);
    // In case of error, we return a default state to avoid crashing the page.
    return { dailyProblem: null };
  }
}

/**
 * Fetches the in-progress projects for the currently authenticated user.
 */
export async function fetchInProgressProjects() {
  noStore();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const startedProjectsProgress = await prisma.projectProgress.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: { id: true, name: true, description: true, domain: true, maxTime: true, coverImage: true },
        },
      },
    });

    const submittedProjectIds = new Set(
      (await prisma.submittedProjects.findMany({
        where: { userId: user.id },
        select: { projectId: true },
      })).map((p) => p.projectId)
    );

    const inProgressProjects = startedProjectsProgress
      .filter((progress) => !submittedProjectIds.has(progress.projectId))
      .map((progress) => ({
        ...progress.project,
        startedAt: progress.startedAt.toISOString(),
      }));

    return inProgressProjects;
  } catch (error) {
    console.error("Database Error (fetchInProgressProjects):", error);
    return [];
  }
}

/**
 * Fetches the leaderboard data for the currently authenticated user's league.
 */
export async function fetchLeaderboardData() {
  noStore();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { league: null, leaderboard: [], currentUserId: null, message: "Unauthorized" };
    }

    // This is a simplified version of your logic, you can adapt your date logic as needed
    const weekStartDate = new Date();
    weekStartDate.setUTCDate(weekStartDate.getUTCDate() - weekStartDate.getUTCDay());
    weekStartDate.setUTCHours(0, 0, 0, 0);

    const userProfileWithGroup = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        currentGroup: {
          select: { id: true, league: true, weekStartDate: true, members: { select: { id: true, name: true, username: true, avatar_url: true } } },
        },
      },
    });

    const group = userProfileWithGroup?.currentGroup;

    if (!group) {
        return { league: null, leaderboard: [], currentUserId: user.id, message: "You are not in a league." };
    }

    const memberIds = group.members.map((member) => member.id);
    const weeklyScores = await prisma.problemSolution.groupBy({
      by: ["userId"],
      where: { userId: { in: memberIds }, status: "Solved", firstSolvedAt: { gte: weekStartDate } },
      _sum: { xpEarned: true },
    });

    const scoreMap = new Map<string, number>(
      weeklyScores.map(score => [score.userId, score._sum.xpEarned || 0])
    );

    const leaderboard = group.members
      .map((member) => ({ ...member, weeklyXP: scoreMap.get(member.id) || 0 }))
      .sort((a, b) => b.weeklyXP - a.weeklyXP);

    return { league: group.league, leaderboard, currentUserId: user.id, message: null };
  } catch (error) {
    console.error("Database Error (fetchLeaderboardData):", error);
    return { league: null, leaderboard: [], currentUserId: null, message: "Error fetching leaderboard." };
  }
}