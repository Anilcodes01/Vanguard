import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Prisma } from "@prisma/client";

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
    <div className="min-h-screen text-zinc-100 selection:bg-orange-500 selection:text-white">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 border-b border-zinc-800/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-black font-bold tracking-tight">
              My <span className="text-orange-500">Notes</span>
            </h1>
            <p className="mt-2 text-black">
              Your personal collection of thoughts and solutions.
            </p>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            Total: <span className="text-orange-500">{notes.length}</span>
          </div>
        </header>

        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function NoteCard({ note }: { note: NoteWithDetails }) {
  const contextTitle =
    note.project?.title ||
    note.problem?.title ||
    note.internshipWeek?.title ||
    "General Note";

  const contextType = note.project
    ? "Project"
    : note.problem
    ? "Problem"
    : "Week " + (note.internshipWeek?.weekNumber || "?");

  return (
    <Link href={`/notes/${note.id}`} className="block h-full">
      <article className="group flex flex-col cursor-pointer h-full border border-zinc-200 p-6 rounded-lg hover:border-orange-500/40 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500/90 border border-orange-500/20 bg-orange-500/5 px-2 py-1 rounded-sm">
            {contextType}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {new Date(note.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <h3 className="text-lg font-medium text-black mb-3 truncate pr-2">
          {contextTitle}
        </h3>

        <div className="flex-grow">
          <p className="text-black text-sm leading-relaxed line-clamp-4 font-light">
            {note.content.replace(/<[^>]*>?/gm, "")}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-end">
          <button className="text-xs font-medium cursor-pointer text-zinc-500 group-hover:text-orange-400 transition-colors flex items-center gap-1">
            View Details <span>→</span>
          </button>
        </div>
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
      <div className="bg-zinc-900/50 p-4 rounded-full mb-4 ring-1 ring-zinc-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-orange-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-zinc-200">No notes found</h3>
      <p className="text-zinc-500 mt-2 text-sm max-w-xs">
        Notes you create during your projects and challenges will appear here.
      </p>
    </div>
  );
}
