import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";
import { unstable_cache } from "next/cache";

type DashboardProject = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime?: string;
  coverImage?: string | null;
  startedAt: string;
  isInternship: boolean;
  weekNumber?: number;
  progress?: number;
  totalTasks?: number;
};

type LeaderboardMember = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  weeklyXP: number;
};

type LeaderboardData = {
  league: string | null;
  leaderboard: LeaderboardMember[];
};

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

async function getInternshipDailyProblem(userId: string) {
  const now = new Date();

  const internshipProblem = await prisma.internshipProblem.findFirst({
    where: {
      internshipWeek: { userId },
      unlockAt: {
        not: null,
        lte: now,
      },
      isCompleted: false,
    },
    orderBy: {
      unlockAt: "desc",
    },
    include: {
      internshipWeek: {
        select: {
          weekNumber: true,
        },
      },
    },
  });

  if (!internshipProblem || !internshipProblem.originalProblemId) return null;

  const originalProblem = await prisma.problem.findUnique({
    where: { id: internshipProblem.originalProblemId },
    select: {
      id: true,
      slug: true,
      difficulty: true,
      tags: true,
      acceptanceRate: true,
    },
  });

  if (!originalProblem) return null;

  return {
    id: originalProblem.id,
    slug: originalProblem.slug,
    title: internshipProblem.title,
    difficulty: originalProblem.difficulty,
    tags: originalProblem.tags,
    acceptanceRate: originalProblem.acceptanceRate,
    isInternship: true,
    weekNumber: internshipProblem.internshipWeek.weekNumber,
    internshipProblemId: internshipProblem.id,
  };
}

async function getInternshipActiveProjects(
  userId: string
): Promise<DashboardProject[]> {
  const activeWeek = await prisma.internshipWeek.findFirst({
    where: {
      userId,
      projects: {
        some: {
          startedAt: { not: null },
          isCompleted: false,
        },
      },
    },
    include: {
      projects: {
        where: {
          startedAt: { not: null },
          isCompleted: false,
        },
      },
      problems: true,
    },
  });

  if (!activeWeek || !activeWeek.projects[0]) return [];

  const project = activeWeek.projects[0];

  const totalProblems = activeWeek.problems.length;
  const completedProblems = activeWeek.problems.filter(
    (p) => p.isCompleted
  ).length;

  return [
    {
      id: project.id,
      name: project.title,
      description: project.description,
      domain: "Internship",
      startedAt: project.startedAt!.toISOString(),
      isInternship: true,
      weekNumber: activeWeek.weekNumber || 1,
      coverImage: null,
      progress: completedProblems,
      totalTasks: totalProblems,
    },
  ];
}

const getStandardDailyProblem = async (userId: string) => {
  const solvedProblems = await prisma.problemSolution.findMany({
    where: { userId, status: "Solved" },
    select: { problemId: true },
  });
  const solvedProblemIds = solvedProblems.map((p) => p.problemId);

  const unsolvedProblemsCount = await prisma.problem.count({
    where: { id: { notIn: solvedProblemIds } },
  });

  if (unsolvedProblemsCount === 0) return null;

  const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);

  const problem = await prisma.problem.findFirst({
    where: { id: { notIn: solvedProblemIds } },
    skip: randomSkip,
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      tags: true,
      acceptanceRate: true,
    },
  });

  if (!problem) return null;

  return { ...problem, isInternship: false };
};

const getStandardInProgressProjects = async (
  userId: string
): Promise<DashboardProject[]> => {
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
      isInternship: false,
    }));
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasInternship = await prisma.internshipWeek.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    let dailyProblem;
    let projects: DashboardProject[] = [];

    if (hasInternship) {
      const [internshipProblem, internshipProjects] = await Promise.all([
        getInternshipDailyProblem(user.id),
        getInternshipActiveProjects(user.id),
      ]);

      dailyProblem = internshipProblem;
      projects = internshipProjects;

      if (!dailyProblem) {
        dailyProblem = await getStandardDailyProblem(user.id);
      }

      const standardProjects = await getStandardInProgressProjects(user.id);
      projects = [...projects, ...standardProjects];
    } else {
      const [standardProblem, standardProjects] = await Promise.all([
        getStandardDailyProblem(user.id),
        getStandardInProgressProjects(user.id),
      ]);
      dailyProblem = standardProblem;
      projects = standardProjects;
    }

    const leaderboardData = await getLeaderboardData(user.id);

    return NextResponse.json({
      dailyProblem,
      projects,
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
