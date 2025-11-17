"use client";

import Image from "next/image";
import { Layers, ThumbsUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ExploreProject } from "@/types";

const PlaceholderIcon = () => (
  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
    <Layers className="w-12 h-12 text-gray-400" />
  </div>
);

export default function ProjectCard({ project }: { project: ExploreProject }) {
  const router = useRouter();

  const topSubmission = useMemo(() => {
    if (!project.SubmittedProjects || project.SubmittedProjects.length === 0) {
      return null;
    }
    return [...project.SubmittedProjects].sort(
      (a, b) => b._count.upvotes - a._count.upvotes
    )[0];
  }, [project.SubmittedProjects]);

  const userProfile = topSubmission?.user?.profiles?.[0];
  const displayImage = topSubmission?.coverImage || project.coverImage;

  return (
    <div
      onClick={() => {
        router.push(`/projects/${project.id}`);
      }}
      className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white text-black shadow-lg shadow-black/20 transition-all duration-300 hover:border-orange-600 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {displayImage ? ( 
          <Image
            src={displayImage}
            alt={`Cover image for ${project.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <PlaceholderIcon />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="mb-2 truncate text-lg font-bold text-black">
          {project.name}
        </h3>
        <p className="mb-4 h-[3.75rem] text-sm text-gray-600 line-clamp-3">
          {project.description}
        </p>

        {userProfile ? (
          <div className="mb-4 flex items-center gap-3">
            <Image
              src={userProfile.avatar_url || "/user.png"}
              alt={userProfile.name || "User"}
              width={32}
              height={32}
              className="rounded-full bg-gray-100"
            />
            <div>
              <p className="text-xs text-gray-600">Top submission by</p>
              <p className="text-sm font-semibold text-black">
                {userProfile.name || "Anonymous User"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100"></div>
            <div>
              <p className="text-xs text-gray-600">Top submission by</p>
              <p className="text-sm font-semibold text-gray-600">
                Anonymous User
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-600">
          <span className="inline-flex items-center gap-2">
            <Layers size={16} className="text-orange-400" />
            <span className="font-medium">{project.domain}</span>
          </span>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2" title="Upvotes">
              <ThumbsUp size={16} className="text-orange-400" />
              <span className="font-medium">
                {topSubmission?._count.upvotes ?? 0}
              </span>
            </span>
            <span className="inline-flex items-center gap-2" title="Comments">
              <MessageCircle size={16} className="text-gray-400" />
              <span className="font-medium">
                {topSubmission?._count.comments ?? 0}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}