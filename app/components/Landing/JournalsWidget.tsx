"use client";

import { useEffect, useState, useCallback } from "react";
import { getCommunityJournals } from "@/app/actions/JournalActions";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { User, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export type UserMetaData = {
  full_name?: string;
  avatar_url?: string;
};

type JournalEntry = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    email: string | null;

    raw_user_meta_data: UserMetaData | null;
    profiles: {
      name: string | null;
      username: string | null;
      avatar_url: string | null;
    }[];
  };
};

const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export default function JournalsWidget() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const data = await getCommunityJournals();

      setJournals((prev) => {
        const isNewPost =
          data.length > 0 && prev.length > 0 && data[0].id !== prev[0].id;
        if (isNewPost) {
          setCurrentIndex(0);
        }

        return data as unknown as JournalEntry[];
      });
    } catch (error) {
      console.error("Failed to load journals", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleJournalCreated = () => {
      console.log("New journal detected, refreshing widget...");
      fetchData();
    };

    window.addEventListener("journal_created", handleJournalCreated);

    return () => {
      window.removeEventListener("journal_created", handleJournalCreated);
    };
  }, [fetchData]);

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, [fetchData]);

  useEffect(() => {
    if (journals.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % journals.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [journals.length]);

  if (loading) return null;
  if (journals.length === 0) return null;

  const currentJournal = journals[currentIndex];

  if (!currentJournal) return null;

  const profile = currentJournal.user.profiles[0];
  const meta = currentJournal.user.raw_user_meta_data;
  const name = profile?.name || meta?.full_name || "Explorer";
  const avatar = profile?.avatar_url || meta?.avatar_url;

  const strippedContent = stripHtml(currentJournal.content);
  const displayContent = truncateText(strippedContent, 300);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>Community Pulse</span>
        </div>
        <Link
          href="/journal"
          className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentJournal.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-start gap-3 mb-3 flex-shrink-0">
                <div className="relative h-9 w-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="p-2 w-full h-full text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(currentJournal.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">
                  {displayContent}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
