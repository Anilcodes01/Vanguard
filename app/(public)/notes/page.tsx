import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  BookOpen,
  Code2,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

type NoteWithDetails = Prisma.NoteGetPayload<{
  include: {
    internshipWeek: {
      select: { title: true; weekNumber: true };
    };
    problem: {
      select: { title: true };
    };
    project: {
      select: { title: true };
    };
  };
}>;

export default async function NotesPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    include: {
      internshipWeek: {
        select: { title: true, weekNumber: true },
      },
      problem: {
        select: { title: true },
      },
      project: {
        select: { title: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      {}
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Personal Workspace
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            My Notes
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {notes.length} notes from your projects and problems
          </p>
        </div>
      </div>

      {}
      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }: { note: NoteWithDetails }) {
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

  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group relative flex flex-col justify-between bg-white border border-gray-200 p-6 rounded-3xl hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[240px]"
    >
      <div>
        {}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {}
            <div
              className={`h-8 w-8 rounded-full border flex items-center justify-center flex-shrink-0 relative
              ${isProject ? "bg-blue-50 border-blue-100 text-blue-500" : ""}
              ${
                isProblem
                  ? "bg-purple-50 border-purple-100 text-purple-500"
                  : ""
              }
              ${
                !isProject && !isProblem
                  ? "bg-orange-50 border-orange-100 text-orange-500"
                  : ""
              }
            `}
            >
              {isProject && <Layers className="w-4 h-4" />}
              {isProblem && <Code2 className="w-4 h-4" />}
              {!isProject && !isProblem && <FileText className="w-4 h-4" />}
            </div>

            {}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 line-clamp-1">
                {contextType}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {}
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
          {contextTitle}
        </h2>

        {}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 font-normal">
          {note.content.replace(/<[^>]*>?/gm, "").substring(0, 150)}
        </p>
      </div>

      {}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100 mt-auto">
        <span className="text-[10px] uppercase tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded-md">
          {isProject ? "Development" : isProblem ? "Algorithm" : "Learning"}
        </span>

        <span className="text-xs font-medium text-gray-400 group-hover:text-orange-500 transition-colors flex items-center gap-1">
          Read <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
      <p className="text-gray-500 mb-6 text-sm">
        Notes you create during your projects will appear here.
      </p>
    </div>
  );
}
