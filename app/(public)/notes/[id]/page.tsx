import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Code2,
  FileText,
  Github,
  Globe,
  Layers,
  Target,
} from "lucide-react";


export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const note = await prisma.note.findUnique({
    where: {
      id: id,
      userId: user.id,
    },
    include: {
      internshipWeek: true,
      problem: true,
      project: true,
    },
  });

  if (!note) {
    notFound();
  }

  const isProject = !!note.project;
  const isProblem = !!note.problem;

  const contextTitle =
    note.project?.title ||
    note.problem?.title ||
    note.internshipWeek?.title ||
    "General Note";

  const contextType = isProject
    ? "Project"
    : isProblem
    ? "Problem"
    : `Week ${note.internshipWeek?.weekNumber}`;

  return (
    <div className="min-h-screen text-zinc-200 selection:bg-orange-500/30 selection:text-orange-200">
      <nav className="border-b border-zinc-200 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/notes"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-orange-500 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Notes
          </Link>

          <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(note.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                ${
                  isProject
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : ""
                }
                ${
                  isProblem
                    ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                    : ""
                }
                ${
                  !isProject && !isProblem
                    ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                    : ""
                }
              `}
              >
                {isProject && <Layers className="w-3 h-3" />}
                {isProblem && <Code2 className="w-3 h-3" />}
                {!isProject && !isProblem && <FileText className="w-3 h-3" />}
                {contextType}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              {contextTitle}
            </h1>
          </div>

          <div
            className="prose prose-invert prose-zinc max-w-none 
            prose-headings:text-zinc-100 
            prose-p:text-zinc-400 prose-p:leading-relaxed
            prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-zinc-200
            prose-code:text-orange-300 prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
            prose-blockquote:border-l-orange-500 prose-blockquote:bg-zinc-900/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
            "
          >
            <div
              className="text-black"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="text-black border border-zinc-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-sm  text-black  tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Related Context
            </h2>

            {note.project && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {note.project.description.length > 150
                    ? `${note.project.description.substring(0, 150)}...`
                    : note.project.description}
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  {note.project.githubLink && (
                    <a
                      href={note.project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all"
                    >
                      <Github className="w-3.5 h-3.5" />
                      View Repository
                    </a>
                  )}
                  {note.project.liveLink && (
                    <a
                      href={note.project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-100 hover:bg-white border border-transparent rounded-lg text-xs font-medium text-black transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      View Live Project
                    </a>
                  )}
                </div>
              </div>
            )}

            {note.problem && (
              <div className="space-y-4">
                <div className=" p-3 rounded-lg border border-zinc-200">
                  <p className="text-xs text-black mb-1">Problem Title</p>
                  <p className="text-sm font-medium text-zinc-500">
                    {note.problem.title}
                  </p>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {note.problem.description.substring(0, 150)}...
                </p>
                <div className="pt-2">
                  <div
                    className={`text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                      note.problem.isCompleted
                        ? "border-green-500/20 text-green-400 bg-green-500/10"
                        : "border-zinc-700 text-zinc-400 bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        note.problem.isCompleted
                          ? "bg-green-500"
                          : "bg-zinc-500"
                      }`}
                    />
                    {note.problem.isCompleted ? "Solved" : "In Progress"}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-zinc-200">
              <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase">
                Internship Week
              </h3>
              <div className=" p-4 rounded-lg border border-zinc-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-zinc-500">
                    {note.internshipWeek.title}
                  </span>
                  <span className="text-xs font-mono text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                    W{note.internshipWeek.weekNumber}
                  </span>
                </div>
                {note.internshipWeek.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {note.internshipWeek.topics.slice(0, 4).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-zinc-200 text-black px-1.5 py-0.5 rounded border border-zinc-700/50"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
