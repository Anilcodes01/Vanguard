"use client";

import React from "react";
import { ProjectSubmission } from "@/types";
import { ArrowBigUp, MessageCircle, Tag, Bookmark } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
  project: ProjectSubmission;
  rank: number;
  onClick: () => void;
  onUpvote: () => void;
  onBookmark: () => void;
}

export default function ProjectCard({
  project,
  rank,
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
      className="flex items-center gap-4 p-4 rounded-lg cursor-pointer bg-[#333] hover:bg-neutral-700 transition-colors border border-transparent hover:border-neutral-600"
      onClick={onClick}
    >
      <div className="text-lg font-medium text-neutral-400">#{rank}</div>

      <Image
        src={project.coverImage || userProfile?.avatar_url || "/user.png"}
        alt={project.project.name}
        width={64}
        height={64}
        className="rounded-xl h-16 w-16 object-cover flex-shrink-0"
      />

      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-white text-lg truncate">
          {project.project.name}
        </h3>
        <p className="text-neutral-300 text-sm truncate">
          {project.short_description || "No description available."}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{project.commentsCount ?? 0}</span>
          </div>
          {project.builtWith && project.builtWith.length > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.builtWith.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleBookmarkClick}
          className={`flex flex-col items-center justify-center p-2 border rounded-md w-16 h-16 flex-shrink-0 transition-colors
            ${
              project.hasBookmarked
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-neutral-600 bg-neutral-700/50 hover:bg-neutral-600 text-neutral-300"
            }`}
        >
          <Bookmark
            className={`w-5 h-5 ${
              project.hasBookmarked ? "fill-current text-blue-500" : ""
            }`}
          />
          <span className="text-sm font-semibold mt-1">
            {project.bookmarksCount ?? 0}
          </span>
        </button>

        <button
          onClick={handleUpvoteClick}
          className={`flex flex-col items-center justify-center p-2 border rounded-md w-16 h-16 flex-shrink-0 transition-colors
            ${
              project.hasUpvoted
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-neutral-600 bg-neutral-700/50 hover:bg-neutral-600 text-neutral-300"
            }`}
        >
          <ArrowBigUp
            className={`w-6 h-6 ${
              project.hasUpvoted ? "fill-current text-green-500" : ""
            }`}
          />
          <span className="text-sm font-semibold">
            {project.upvotesCount ?? 0}
          </span>
        </button>
      </div>
    </div>
  );
}
