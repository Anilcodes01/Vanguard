import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getProfileData = cache(async (username: string) => {
  const profile = await prisma.profiles.findUnique({
    where: { username: username },
  });

  if (!profile) return null;

  const [
    submissions,
    totalSubmissionsCount,
    problemSolutions,
    submittedProjects,
    totalProjectsCount,
    internshipProjects,
    totalInternshipProjectsCount,
    allProblems,
    allUserSubmissions,
  ] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        problem: { select: { title: true, difficulty: true, tags: true } },
      },
    }),
    prisma.submission.count({ where: { userId: profile.id } }),
    prisma.problemSolution.findMany({
      where: { userId: profile.id, status: "Solved" },
      include: { problem: { select: { difficulty: true } } },
    }),
    prisma.submittedProjects.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { name: true } } },
    }),
    prisma.submittedProjects.count({ where: { userId: profile.id } }),
    prisma.internshipProject.findMany({
      where: { internshipWeek: { userId: profile.id }, isCompleted: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        internshipWeek: { select: { title: true, weekNumber: true } },
      },
    }),
    prisma.internshipProject.count({
      where: { internshipWeek: { userId: profile.id }, isCompleted: true },
    }),
    prisma.problem.findMany({
      select: { id: true, difficulty: true },
    }),
    prisma.submission.findMany({
      where: { userId: profile.id },
      select: { status: true, problem: { select: { difficulty: true } } },
    }),
  ]);

  const createStat = () => ({
    total: 0,
    solved: 0,
    submissions: 0,
    acceptedSubmissions: 0,
  });

  const stats = {
    all: createStat(),
    Easy: createStat(),
    Medium: createStat(),
    Hard: createStat(),
  };

  allProblems.forEach((p) => {
    if (stats[p.difficulty]) {
      stats[p.difficulty].total++;
      stats.all.total++;
    }
  });

  problemSolutions.forEach((sol) => {
    const diff = sol.problem.difficulty;
    if (stats[diff]) {
      stats[diff].solved++;
      stats.all.solved++;
    }
  });

  allUserSubmissions.forEach((sub) => {
    const diff = sub.problem.difficulty;
    if (stats[diff]) {
      stats[diff].submissions++;
      stats.all.submissions++;

      if (sub.status === "Accepted") {
        stats[diff].acceptedSubmissions++;
        stats.all.acceptedSubmissions++;
      }
    }
  });

  return {
    profile,
    submissions,
    totalSubmissionsCount,
    problemSolutions,
    submittedProjects,
    totalProjectsCount,
    internshipProjects,
    totalInternshipProjectsCount,
    difficultyStats: stats,
  };
});
