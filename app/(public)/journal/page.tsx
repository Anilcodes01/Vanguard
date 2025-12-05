import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { BookOpen, User as UserIcon, Notebook } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
};

type PrismaUser = {
  email: string | null;
  raw_user_meta_data: UserMetaData | null;
  profiles: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  }[];
};

interface GroupedNote {
  userId: string;
  user: PrismaUser;
  weekNumber: number;
  noteCount: number;
  latestDate: Date;
}

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Link
          href="/login"
          className="flex p-3 px-6 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-medium"
        >
          Please Log In
        </Link>
      </div>
    );
  }

  const currentUserProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          raw_user_meta_data: true,
          profiles: {
            select: { name: true, username: true, avatar_url: true },
          },
        },
      },
      internshipWeek: { select: { weekNumber: true } },
    },
  });

  const groupedNotes = notes.reduce<Record<string, GroupedNote>>(
    (acc, note) => {
      if (!note.user || !note.internshipWeek?.weekNumber) return acc;
      const key = `${note.userId}-${note.internshipWeek.weekNumber}`;

      if (!acc[key]) {
        acc[key] = {
          userId: note.userId,
          user: note.user as PrismaUser,
          weekNumber: note.internshipWeek.weekNumber,
          noteCount: 0,
          latestDate: new Date(note.createdAt),
        };
      }
      acc[key].noteCount += 1;
      if (new Date(note.createdAt) > acc[key].latestDate) {
        acc[key].latestDate = new Date(note.createdAt);
      }
      return acc;
    },
    {}
  );

  const notesToDisplay = Object.values(groupedNotes).sort(
    (a, b) => b.latestDate.getTime() - a.latestDate.getTime()
  );

  const displayName =
    currentUserProfile?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Explorer";

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            Community Journals
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {notesToDisplay.length} weekly summaries from the community.
          </p>
        </div>
        <div>
          <Link
            href={"/internship"}
            className="bg-orange-400 text-white gap-2 flex px-5 py-2.5 justify-center items-center hover:bg-orange-500 transition-all shadow-sm hover:shadow-md cursor-pointer rounded-2xl font-medium"
          >
            <BookOpen className="w-5 h-5" />
            My Dashboard
          </Link>
        </div>
      </div>

      {notesToDisplay.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Notebook className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="text-gray-500">
            Learnings from the community will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notesToDisplay.map((group) => {
            const authorProfile = group.user.profiles?.[0];
            const metaData = group.user.raw_user_meta_data;
            const authorName =
              authorProfile?.name ||
              metaData?.full_name ||
              authorProfile?.username ||
              group.user.email?.split("@")[0] ||
              "Anonymous";
            const avatarUrl = authorProfile?.avatar_url || metaData?.avatar_url;

            return (
              <Link
                href={`/journal/${group.userId}/${group.weekNumber}`}
                key={`${group.userId}-${group.weekNumber}`}
                className="group relative flex flex-col justify-between bg-white border border-gray-200 p-6 rounded-3xl hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[240px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                        {avatarUrl ? (
                          <Image
                            width={32}
                            height={32}
                            src={avatarUrl}
                            alt={authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {authorName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {format(new Date(group.latestDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    Week {group.weekNumber} Learnings
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    Contains {group.noteCount} notes on projects, problems, and
                    general thoughts from this week.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto relative z-10 pt-4 border-t border-dashed border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded-md font-semibold">
                    Week {group.weekNumber}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
