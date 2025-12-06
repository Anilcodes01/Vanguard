import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { User as UserIcon, BookOpen } from "lucide-react";
import CreateJournalModal from "@/app/components/journal/CreateJournalModal";
import sanitizeHtml from "sanitize-html";

type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
};

type JournalUser = {
  email: string | null;
  raw_user_meta_data: unknown;
  profiles: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  }[];
};

const getUserDetails = (user: JournalUser) => {
  const profile = user.profiles?.[0];

  const meta = user.raw_user_meta_data as UserMetaData;

  return {
    name: profile?.name || meta?.full_name || profile?.username || "Explorer",
    username: profile?.username || user.email?.split("@")[0] || "user",
    avatar: profile?.avatar_url || meta?.avatar_url,
  };
};

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-medium text-gray-900">Please Log In</h2>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const currentUserProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  const currentUserAvatar =
    currentUserProfile?.avatar_url || user.user_metadata?.avatar_url;

  const displayName =
    currentUserProfile?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Explorer";

  const journals = await prisma.journal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          raw_user_meta_data: true,
          profiles: {
            select: { name: true, username: true, avatar_url: true },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      {}
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            My Journals
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {journals.length} entries recorded.
          </p>
        </div>
        <div>
          <CreateJournalModal userAvatar={currentUserAvatar} />
        </div>
      </div>

      {}
      <div className="space-y-6">
        {journals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No journals yet
            </h3>
            <p className="text-gray-500 max-w-sm text-center mt-2">
              Click the &quot;Write Journal&quot; button above to document your
              journey.
            </p>
          </div>
        ) : (
          journals.map((post) => {
            const author = getUserDetails(post.user);

            const isHtml = /<\/?[a-z][\s\S]*>/i.test(post.content);
            const contentToRender = isHtml
              ? post.content
              : post.content.replace(/\n/g, "<br />");

            const safeContent = sanitizeHtml(contentToRender, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img",
                "br",
                "h1",
                "h2",
              ]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt", "width", "height"],
              },
            });

            return (
              <div
                key={post.id}
                className="bg-white border border-gray-200 p-6 md:p-8 rounded-3xl shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-4">
                  {}
                  <div className="flex-shrink-0 pt-1">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 overflow-hidden relative ring-1 ring-gray-100">
                      {author.avatar ? (
                        <Image
                          src={author.avatar}
                          alt={author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                          <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-base">
                          {author.name}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div
                      className="text-gray-800 text-[15px] md:text-[16px] leading-relaxed break-words 
                      [&>p]:mb-3 last:[&>p]:mb-0 
                      [&>a]:text-orange-600 [&>a]:hover:underline [&>a]:font-medium"
                      dangerouslySetInnerHTML={{ __html: safeContent }}
                    />

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                        {post.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md"
                          >
                            #{tag.replace("#", "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
