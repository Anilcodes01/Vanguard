import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import HellipadFeed from "./components/HellipadFeed";

export default async function Hellipad() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-6 min-h-screen items-center justify-center bg-white text-gray-900">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Access Restricted
          </h1>
          <p className="text-gray-500">
            Please log in to view the Hellipad projects.
          </p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-200">
          Login
        </button>
      </div>
    );
  }

  const getProjects = await prisma.internshipProject.findMany({
    where: {
      isCompleted: true,
    },
    select: {
      id: true,
      title: true,
      customTitle: true,
      description: true,
      shortDescription: true,
      tags: true,
      createdAt: true,

      overview: true,
      githubLink: true,
      liveLink: true,
      screenshots: true,
      internshipWeek: {
        select: {
          user: {
            select: {
              profiles: {
                select: {
                  name: true,
                  username: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {}
        <div className="space-y-1 border-l-4 border-orange-500 pl-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Hellipad
          </h1>
          <p className="text-gray-500 text-lg">
            Showcase of latest internship projects.
          </p>
        </div>

        {}
        <HellipadFeed projects={getProjects} />
      </div>
    </div>
  );
}
