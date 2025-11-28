"use server";

import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 5;

export async function fetchMoreSubmissions(userId: string, page: number) {
  const skip = page * ITEMS_PER_PAGE;

  const submissions = await prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: skip,
    take: ITEMS_PER_PAGE,
    include: {
      problem: { select: { title: true, difficulty: true } },
    },
  });

  return submissions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function fetchMoreProjects(userId: string, page: number) {
  const skip = page * ITEMS_PER_PAGE;

  const projects = await prisma.submittedProjects.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: skip,
    take: ITEMS_PER_PAGE,
    include: {
      project: { select: { name: true } },
    },
  });

  return projects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));
}
