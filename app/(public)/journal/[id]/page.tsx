import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Clock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import DeleteButton from "@/app/components/journal/DeleteButton";

type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
};

interface JournalEntryProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JournalEntryPage({ params }: JournalEntryProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const journal = await prisma.journal.findUnique({
    where: {
      id: id,
    },
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

  if (!journal) {
    return notFound();
  }

  const authorProfile = journal.user.profiles?.[0];
  const metaData = journal.user.raw_user_meta_data as UserMetaData;

  const authorName =
    authorProfile?.name ||
    metaData?.full_name ||
    authorProfile?.username ||
    journal.user.email?.split("@")[0] ||
    "Anonymous";

  const avatarUrl = authorProfile?.avatar_url || metaData?.avatar_url;

  const isOwner = user.id === journal.userId;

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      {}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
        <Link
          href="/journal"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Journals
        </Link>

        {isOwner && (
          <div className="flex items-center gap-3">
            <DeleteButton journalId={journal.id} />
          </div>
        )}
      </div>

      {}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-3 mb-6">
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

        <div className="flex items-center gap-4 text-sm text-gray-400 font-mono border-t border-gray-50 pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(journal.createdAt), "MMMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(journal.createdAt), "h:mm a")}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {journal.title}
        </h1>

        {journal.description && (
          <p className="text-xl text-gray-500 italic border-l-4 border-orange-200 pl-4 py-1">
            {journal.description}
          </p>
        )}

        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {journal.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-600 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="prose-content">
        <div
          dangerouslySetInnerHTML={{ __html: journal.content }}
          className="text-lg leading-relaxed text-gray-800"
        />
      </div>

      <style>{`
        .prose-content h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
        .prose-content h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
        .prose-content p { margin-bottom: 1.25em; }
        .prose-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.25em; }
        .prose-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.25em; }
        .prose-content blockquote { border-left: 4px solid #fed7aa; padding-left: 1em; font-style: italic; color: #4b5563; margin-bottom: 1.25em; }
        .prose-content a { color: #f97316; text-decoration: underline; }
        .prose-content pre { background: #f3f4f6; padding: 1em; border-radius: 0.5em; overflow-x: auto; font-family: monospace; }
        .prose-content img { border-radius: 0.5em; margin-top: 1em; margin-bottom: 1em; }
      `}</style>
    </div>
  );
}
