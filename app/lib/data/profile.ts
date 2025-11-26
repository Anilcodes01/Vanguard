import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getProfileData = cache(async (username: string) => {
  const profile = await prisma.profiles.findUnique({
    where: { username: username },
  });

  if (!profile) return null;

  const [submissions, problemSolutions, submittedProjects] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        problem: { select: { title: true } },
      },
    }),
    prisma.problemSolution.findMany({
      where: { userId: profile.id },
    }),
    prisma.submittedProjects.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { name: true } },
      },
    }),
  ]);

  return {
    profile,
    submissions,
    problemSolutions,
    submittedProjects,
  };
});
