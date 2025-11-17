import ProjectCard from "@/app/components/Landing/Projects/ProjectsCard";
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const revalidate = 600;

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

const getProjectsByDomain = cache(
  async (): Promise<{ projects: Project[] }> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in to view projects.");
    }

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        domain: true,
      },
    });

    if (!userProfile || !userProfile.domain) {
      throw new Error(
        "Profile not found or no domain is set for your profile."
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        domain: userProfile.domain,
      },
      select: {
        id: true,
        name: true,
        description: true,
        domain: true,
        maxTime: true,
        coverImage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { projects };
  }
);

export default async function ProjectsPage() {
  try {
    const data = await getProjectsByDomain();

    if (!data || !data.projects || data.projects.length === 0) {
      return (
        <main className="min-h-screen bg-[#ffffff] p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Projects</h1>
            <div className="text-center text-neutral-400 text-lg">
              No projects found for your domain.
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#ffffff] p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Projects</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {data.projects.map((project, index: number) => (
              <ProjectCard
                key={project.id}
                project={project}
                priority={index < 3}
              />
            ))}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#ffffff] text-red-400">
        Error: {errorMessage}
      </div>
    );
  }
}
