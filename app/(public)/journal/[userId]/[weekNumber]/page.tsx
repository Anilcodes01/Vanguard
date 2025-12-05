import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User as UserIcon,
  Code,
  FolderGit2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
};

const NoteCard = ({
  title,
  content,
  icon,
}: {
  title: string;
  content: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
      {icon}
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6 prose-content">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  </div>
);

export default async function WeeklyNotesPage({
  params,
}: {
  params: Promise<{ userId: string; weekNumber: string }>;
}) {
  const { userId, weekNumber } = await params;

  const weekNumberInt = parseInt(weekNumber, 10);

  if (!userId || isNaN(weekNumberInt)) {
    return notFound();
  }

  const author = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      email: true,
      raw_user_meta_data: true,
      profiles: {
        select: { name: true, username: true, avatar_url: true },
      },
    },
  });

  if (!author) {
    return notFound();
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: userId,
      internshipWeek: {
        weekNumber: weekNumberInt,
      },
    },
    include: {
      project: { select: { title: true } },
      problem: { select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (notes.length === 0) {
    return notFound();
  }

  const authorProfile = author.profiles?.[0];

  const metaData = author.raw_user_meta_data as UserMetaData | null;
  const authorName =
    authorProfile?.name ||
    metaData?.full_name ||
    authorProfile?.username ||
    author.email?.split("@")[0] ||
    "Anonymous";
  const avatarUrl = authorProfile?.avatar_url || metaData?.avatar_url;

  const projectNotes = notes.filter((n) => n.project);
  const problemNotes = notes.filter((n) => n.problem);
  const generalNote = notes.find((n) => !n.project && !n.problem);

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
        <Link
          href="/journal"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Notes
        </Link>
      </div>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={authorName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">Author</p>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Week {weekNumber} Learnings
        </h1>
        <p className="text-gray-500 mt-2">
          A collection of all notes from this week.
        </p>
      </header>

      <main className="space-y-8">
        {projectNotes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.project?.title || "Project Note"}
            content={note.content}
            icon={<FolderGit2 className="w-5 h-5 text-blue-600" />}
          />
        ))}
        {problemNotes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.problem?.title || "Problem Note"}
            content={note.content}
            icon={<Code className="w-5 h-5 text-green-600" />}
          />
        ))}
        {generalNote && (
          <NoteCard
            key={generalNote.id}
            title="General Overview Note"
            content={generalNote.content}
            icon={<FileText className="w-5 h-5 text-orange-600" />}
          />
        )}
      </main>
    </div>
  );
}
