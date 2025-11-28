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
  ] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        problem: { select: { title: true } },
      },
    }),

    prisma.submission.count({
      where: { userId: profile.id },
    }),

    prisma.problemSolution.findMany({
      where: { userId: profile.id },
    }),

    prisma.submittedProjects.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        project: { select: { name: true } },
      },
    }),

    prisma.submittedProjects.count({
      where: { userId: profile.id },
    }),

    prisma.internshipProject.findMany({
      where: {
        internshipWeek: {
          userId: profile.id,
        },
        isCompleted: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        internshipWeek: {
          select: {
            title: true,
            weekNumber: true,
          },
        },
      },
    }),

    prisma.internshipProject.count({
      where: {
        internshipWeek: { userId: profile.id },
        isCompleted: true,
      },
    }),
  ]);

  return {
    profile,
    submissions,
    totalSubmissionsCount,
    problemSolutions,
    submittedProjects,
    totalProjectsCount,
    internshipProjects,
    totalInternshipProjectsCount,
  };
});
