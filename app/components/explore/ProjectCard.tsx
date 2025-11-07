"use client";

import Image from "next/image";
import { Layers, ThumbsUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type UserProfile = {
  name: string | null;
  avatar_url: string | null;
};

type SubmittedProjectInfo = {
  user: {
    profiles: UserProfile[] | null;
  };
  _count: {
    upvotes: number;
    comments: number;
  };
};

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  coverImage: string | null;
  SubmittedProjects: SubmittedProjectInfo[];
};

const PlaceholderIcon = () => (
  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
    <Layers className="w-12 h-12 text-neutral-600" />
  </div>
);

export default function ProjectCard({ project }: { project: Project }) {
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

  return (
    <div
      onClick={() => {
        router.push(`/projects/${project.id}`);
      }}
      className="group flex flex-col cursor-pointer h-full bg-[#2a2a2a] rounded-2xl overflow-hidden border border-neutral-700/50 shadow-lg shadow-black/20 hover:border-neutral-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
    >
      <div className="relative w-full h-48 overflow-hidden">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={`Cover image for ${project.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        ) : (
          <PlaceholderIcon />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-100 truncate mb-2">
          {project.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {project.description}
        </p>

        {userProfile ? (
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={userProfile.avatar_url || "/user.png"}
              alt={userProfile.name || "User"}
              width={32}
              height={32}
              className="rounded-full bg-neutral-700"
            />
            <div>
              <p className="text-xs text-gray-400">Top submission by</p>
              <p className="text-sm font-semibold text-gray-200">
                {userProfile.name || "Anonymous User"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-neutral-700"></div>
            <div>
              <p className="text-xs text-gray-400">Top submission by</p>
              <p className="text-sm font-semibold text-gray-200">
                Anonymous User
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 p-5 border-t border-neutral-700/50 flex justify-between items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-2">
          <Layers size={16} className="text-blue-400" />
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
            <MessageCircle size={16} className="text-purple-400" />
            <span className="font-medium">
              {topSubmission?._count.comments ?? 0}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}