import { prisma } from "@/lib/prisma";
import ProjectCard from "@/app/components/explore/ProjectCard";
import ProblemCard from "@/app/components/explore/ProblemCard";
import { Prisma } from "@prisma/client";

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
  const [topProjects, topProblems] = await Promise.all([
    getTopProjects(),
    getTopProblems(),
  ]);

  return (
    <div className="min-h-screen bg-white p-4 text-black sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Explore Community Highlights
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Discover the most popular projects and challenging problems tackled
            by our community.
          </p>
        </div>

        <>
          <section id="top-projects" className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold text-black sm:text-left">
              Most Popular Projects
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topProjects.map((project) => (
                <ProjectCard key={project.id} project={project as TopProject} />
              ))}
            </div>
          </section>

          <section id="top-problems">
            <h2 className="mb-8 text-center text-3xl font-bold text-black sm:text-left">
              Most Solved Problems
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem as TopProblem} />
              ))}
            </div>
          </section>
        </>
      </div>
    </div>
  );
}
