import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import ProjectCard from "@/app/components/Landing/Projects/ProjectsCard";
import { Project } from "@prisma/client";

async function getProjectsForUser(): Promise<Project[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { domain: true },
    });

    if (!userProfile || !userProfile.domain) {
      return [];
    }

    const projects = await prisma.project.findMany({
      where: {
        domain: userProfile.domain,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjectsForUser();

  return (
    <main className="min-h-screen bg-[#262626] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Projects</h1>

        {!projects || projects.length === 0 ? (
          <div className="text-center text-neutral-400 text-lg">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}