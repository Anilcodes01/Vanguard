import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import ProjectCard from "@/app/components/explore/ProjectCard";
import ProblemCard from "@/app/components/explore/ProblemCard";
import { Prisma } from "@prisma/client";
import { Sparkles, Trophy, Code2 } from "lucide-react";

export const dynamic = "force-dynamic";

type TopProject = Prisma.PromiseReturnType<typeof getTopProjects>[0];
type TopProblem = Prisma.PromiseReturnType<typeof getTopProblems>[0];

async function getTopProjects() {
  const projects = await prisma.project.findMany({
    include: {
      SubmittedProjects: {
        select: {
          coverImage: true,
          user: {
            select: {
              profiles: { select: { name: true, avatar_url: true } },
            },
          },
          _count: {
            select: { upvotes: true, comments: true },
          },
        },
      },
    },
  });

  return projects
    .map((project) => ({
      ...project,
      totalUpvotes: project.SubmittedProjects.reduce(
        (acc, sub) => acc + sub._count.upvotes,
        0
      ),
    }))
    .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
    .slice(0, 3);
}

async function getTopProblems() {
  return prisma.problem.findMany({
    take: 3,
    orderBy: {
      userProgress: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: {
          userProgress: true,
        },
      },
    },
  });
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "Explorer";
  if (user) {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    displayName = profile?.name || user.user_metadata?.full_name || "Explorer";
  }

  const [topProjects, topProblems] = await Promise.all([
    getTopProjects(),
    getTopProblems(),
  ]);

  return (
    <div className="max- mx-auto p-8 min-h-screen">
      {}
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
            Explore Highlights <Sparkles className="w-6 h-6 text-orange-400" />
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Discover popular projects and top challenges from the community.
          </p>
        </div>
      </div>

      {}
      <div className="space-y-16">
        {}
        <section id="top-projects">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Trending Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProjects.map((project) => (
              <ProjectCard key={project.id} project={project as TopProject} />
            ))}
          </div>
        </section>

        {}
        <div className="border-t border-dashed border-gray-100" />

        {}
        <section id="top-problems">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Most Solved Problems
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem as TopProblem} />
            ))}
          </div>
        </section>

        {}
        <div className="pt-8 text-center">
          <p className="text-xs text-gray-400 font-mono">
            Keep exploring to find more hidden gems.
          </p>
        </div>
      </div>
    </div>
  );
}
