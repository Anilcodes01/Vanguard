import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Clock, Layers } from "lucide-react";
import Link from "next/link";

interface InternshipProject {
  id: string;
  title: string;
  description: string;
  caseStudy: string;
  techStack: string[];
  maxTime: string;
}

export default async function IndividualInternshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const project = await prisma.internshipProject.findUnique({
    where: {
      id: awaitedParams.id,
      userId: user.id,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen  text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/internship"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 text-sm font-medium transition-colors"
        >
          ← Back to Projects
        </Link>

        <div className="bg-[#2a2a2a] rounded-2xl border border-neutral-700/50 shadow-lg shadow-black/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-100">
              {project.title}
            </h1>
            <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/30 px-3 py-1 rounded-full text-sm text-green-400">
              <Clock size={14} />
              <span>{project.maxTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-900/20 border border-blue-500/30 px-3 py-1 rounded-lg text-xs text-blue-400"
              >
                <Layers size={12} />
                {tech}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-200">Description</h2>
            <p className="text-gray-300 leading-relaxed">{project.description}</p>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-2xl border border-neutral-700/50 shadow-lg shadow-black/20 p-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Case Study</h2>
          <p className="text-gray-300 leading-relaxed">{project.caseStudy}</p>
        </div>
      </div>
    </div>
  );
}