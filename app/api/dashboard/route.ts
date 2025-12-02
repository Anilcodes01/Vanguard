import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";
import { unstable_cache } from "next/cache";
import { League } from "@prisma/client";

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

const getDailyProblem = unstable_cache(
  async (userId: string) => {
    // 1. Get IDs of problems the user has already solved
    const solvedProblems = await prisma.problemSolution.findMany({
      where: { userId, status: "Solved" },
      select: { problemId: true },
    });
    const solvedProblemIds = solvedProblems.map((p) => p.problemId);

    // 2. Count available unsolved problems
    const unsolvedProblemsCount = await prisma.problem.count({
      where: { id: { notIn: solvedProblemIds } },
    });

    if (unsolvedProblemsCount === 0) {
      return null;
    }

    // 3. Pick a random unsolved problem
    const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
    
    return prisma.problem.findFirst({
      where: { id: { notIn: solvedProblemIds } },
      skip: randomSkip,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,            // Updated: Renamed from 'topic'
        acceptanceRate: true,  // Updated: Replaced 'maxTime'
      },
    });
  },
  ["daily-problem"],
  {
    tags: ["daily-problem"],
    // Revalidate at the end of the day (midnight)
    revalidate: (() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setUTCHours(24, 0, 0, 0);
      return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    })(),
  }
);

const getInProgressProjects = unstable_cache(
  async (userId: string): Promise<InProgressProject[]> => {
    const startedProjectsProgress = await prisma.projectProgress.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            domain: true,
            maxTime: true, // Note: Project model still has maxTime (String), unlike Problem model
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
  },
  ["in-progress-projects"],
  { revalidate: 120 }
);

const getLeaderboardData = unstable_cache(
  async (userId: string): Promise<LeaderboardData> => {
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
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
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
  },
  ["leaderboard-data"],
  { revalidate: 300 }
);

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