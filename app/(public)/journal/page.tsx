import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Plus, BookOpen, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
};

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

  const journals = await prisma.journal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          raw_user_meta_data: true,
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
  });

  const displayName =
    currentUserProfile?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Explorer";

  return (
    <div className="max-w-6xl mx-auto p-8">
      {}
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            Community Journals
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {journals.length} stories shared by the community
          </p>
        </div>

        <div>
          <Link
            href={"/journal/publish"}
            className="bg-orange-400 text-white gap-2 flex px-5 py-2.5 justify-center items-center hover:bg-orange-500 transition-all shadow-sm hover:shadow-md cursor-pointer rounded-2xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Write Entry
          </Link>
        </div>
      </div>

      {}
      {journals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No journals yet</h3>
          <p className="text-gray-500 mb-6">
            Be the first to share your thoughts.
          </p>
          <Link
            href={"/journal/publish"}
            className="text-orange-500 hover:text-orange-600 font-medium hover:underline"
          >
            Start writing &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => {
            const authorProfile = journal.user.profiles?.[0];

            const metaData = journal.user.raw_user_meta_data as UserMetaData;

            const authorName =
              authorProfile?.name ||
              metaData?.full_name ||
              authorProfile?.username ||
              journal.user.email?.split("@")[0] ||
              "Anonymous";

            const avatarUrl = authorProfile?.avatar_url || metaData?.avatar_url;

            return (
              <Link
                href={`/journal/${journal.id}`}
                key={journal.id}
                className="group relative flex flex-col justify-between bg-white border border-gray-200 p-6 rounded-3xl hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[240px]"
              >
                <div>
                  {}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      {}
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
                      {}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {authorName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {format(new Date(journal.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {journal.title}
                  </h2>

                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    {journal.description}
                  </p>
                </div>

                {}
                {journal.tags && journal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto relative z-10 pt-4 border-t border-dashed border-gray-100">
                    {journal.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {journal.tags.length > 3 && (
                      <span className="text-[10px] text-gray-400 py-1">
                        +{journal.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
