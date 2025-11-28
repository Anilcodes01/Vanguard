"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookMarked, Loader2, Hash, Calendar } from "lucide-react";
import { getCommunityJournals } from "@/app/actions/JournalActions";

type JournalEntry = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: Date;
  author: {
    name: string;
    username: string;
    avatar_url: string | null;
  };
};

export default function JournalsWidget() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCommunityJournals();
        setJournals(data);
      } catch (error) {
        console.error("Failed to load journals", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4 ">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <BookMarked className="w-4 h-4 text-[#f59120]" />
          Community Journals
        </h3>
      </div>

      <div className="space-y-3">
        {journals.length > 0 ? (
          journals.map((journal) => (
            <Link
              key={journal.id}
              href={`/journal/${journal.id}`}
              className="group block bg-white border border-gray-100 rounded-xl p-3.5 hover:border-[#f59120]/30 hover:shadow-sm transition-all duration-200"
            >
              {/* Author & Date */}
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={
                    journal.author.avatar_url ||
                    `https://ui-avatars.com/api/?name=${journal.author.name}&background=f3f4f6&color=000`
                  }
                  alt={journal.author.name}
                  width={18}
                  height={18}
                  className="rounded-full border border-gray-100"
                />
                <span className="text-xs font-medium text-gray-500 truncate max-w-[100px]">
                  {journal.author.name}
                </span>
                <span className="text-[10px] text-gray-300 ml-auto flex items-center gap-1">
                  {new Date(journal.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Title & Description */}
              <div className="mb-2.5">
                <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1 group-hover:text-[#f59120] transition-colors">
                  {journal.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {journal.description}
                </p>
              </div>

              {/* Tags */}
              {journal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {journal.tags.slice(0, 2).map((tag, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-50 text-[10px] text-gray-500 font-medium"
                    >
                      <Hash className="w-2.5 h-2.5 opacity-50" />
                      {tag}
                    </div>
                  ))}
                  {journal.tags.length > 2 && (
                    <span className="text-[10px] text-gray-400 pl-1">
                      +{journal.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <BookMarked className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No journals found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}