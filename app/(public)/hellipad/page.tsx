import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import HellipadFeed from "./components/HellipadFeed";
import { Rocket, Lock } from "lucide-react";
import Link from "next/link";

export default async function Hellipad() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="p-4 bg-gray-50 rounded-full mb-6">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Restricted Access
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
          Please sign in to view the classified Hellipad projects.
        </p>
        <Link
          href="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Log In
        </Link>
      </div>
    );
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { name: true },
  });
  const displayName = profile?.name || user.user_metadata?.full_name || "Pilot";

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
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-white">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-8 gap-6 md:gap-0">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            Hellipad Showcase
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {getProjects.length} projects successfully launched into orbit.
          </p>
        </div>

        {}
        <div className="flex items-center gap-3 bg-orange-50 px-5 py-2.5 rounded-2xl border border-orange-100">
          <Rocket className="w-5 h-5 text-orange-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-orange-400 uppercase font-mono tracking-wider leading-none mb-1">
              Sector
            </span>
            <span className="text-sm font-semibold text-orange-900 leading-none">
              Internship
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="min-h-[400px]">
        {getProjects.length > 0 ? (
          <HellipadFeed projects={getProjects} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Rocket className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No launches yet
            </h3>
            <p className="text-gray-500 text-sm">
              Projects will appear here once completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
