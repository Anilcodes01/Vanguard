import React from "react";
import { ProjectData } from "../types";
import Image from "next/image";

interface HellipadCardProps {
  project: ProjectData;
  onClick: () => void;
}

export default function HellipadCard({ project, onClick }: HellipadCardProps) {
  const authorProfile = project.internshipWeek.user.profiles[0];
  const authorName =
    authorProfile?.name || authorProfile?.username || "Anonymous";

  const displayTitle = project.customTitle || project.title;
  const displayDescription = project.shortDescription || project.description;
  const tags = project.tags || [];

  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex flex-col justify-between bg-gray-50 hover:bg-white border border-transparent hover:border-orange-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
    >
      <div className="space-y-4 w-full">
        <div>
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
            {displayTitle}
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-3">
            {displayDescription}
          </p>
        </div>

        {}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase text-orange-700 bg-orange-50 border border-orange-100 rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-2 py-1 text-[10px] text-gray-400">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {}
      <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
            {authorProfile?.avatar_url ? (
              <Image
                src={authorProfile.avatar_url}
                alt={authorName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
            {authorName}
          </span>
        </div>

        <span className="text-xs font-medium text-gray-400">
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}
