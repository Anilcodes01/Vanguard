"use client";

import React from "react";
import { ProjectSubmission } from "@/types";
import {
  ArrowBigUp,
  MessageCircle,
  Tag,
  Bookmark,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
  project: ProjectSubmission;
  rank: number;
  isBookmarking: boolean;
  onClick: () => void;
  onUpvote: () => void;
  onBookmark: () => void;
}

export default function ProjectCard({
  project,
  rank,
  isBookmarking,
  onClick,
  onUpvote,
  onBookmark,
}: ProjectCardProps) {
  const userProfile = project.user.profiles?.[0];

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote();
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark();
  };

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
      onClick={onClick}
    >
      <div className="text-base sm:text-lg font-medium text-gray-600">
        #{rank}
      </div>
      <Image
        src={project.coverImage || userProfile?.avatar_url || "/user.png"}
        alt={project.name || project.project.name}
        width={64}
        height={64}
        className="rounded-lg sm:rounded-xl h-14 w-14 sm:h-16 sm:w-16 object-cover flex-shrink-0"
      />

      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-black text-base sm:text-lg truncate">
          {project.name || project.project.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm truncate">
          {project.short_description || "No description available."}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{project.commentsCount ?? 0}</span>
          </div>

          <div
            onClick={handleBookmarkClick}
            className={`flex sm:hidden items-center gap-1.5 cursor-pointer ${
              project.hasBookmarked ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {isBookmarking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  project.hasBookmarked ? "fill-current" : ""
                }`}
              />
            )}
            <span>{project.bookmarksCount ?? 0}</span>
          </div>

          {project.builtWith && project.builtWith.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.builtWith.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleBookmarkClick}
          disabled={isBookmarking}
          className={`hidden sm:flex flex-col items-center justify-center p-1 border rounded-md w-14 h-14 flex-shrink-0 transition-colors
            ${
              project.hasBookmarked
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
            } ${isBookmarking ? "cursor-not-allowed" : ""}`}
        >
          {isBookmarking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Bookmark
                className={`w-5 h-5 ${
                  project.hasBookmarked ? "fill-current text-blue-500" : ""
                }`}
              />
              <span className="text-sm font-semibold mt-1">
                {project.bookmarksCount ?? 0}
              </span>
            </>
          )}
        </button>

        <button
          onClick={handleUpvoteClick}
          className={`flex flex-col items-center justify-center p-1 border rounded-md w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 transition-colors
            ${
              project.hasUpvoted
                ? "border-[#f59120] bg-[#f59120]/10 text-orange-400"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
            }`}
        >
          <ArrowBigUp
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              project.hasUpvoted ? "fill-current text-[#f59120]" : ""
            }`}
          />
          <span className="text-xs sm:text-sm font-semibold">
            {project.upvotesCount ?? 0}
          </span>
        </button>
      </div>
    </div>
  );
}
