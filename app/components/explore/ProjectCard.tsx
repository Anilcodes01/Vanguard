"use client";

import Image from "next/image";
import { Layers, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  _count: {
    SubmittedProjects: number;
  };
};

const PlaceholderIcon = () => (
  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
    <Layers className="w-12 h-12 text-neutral-600" />
  </div>
);

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();

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

        <div className="mt-auto pt-4 border-t border-neutral-700/50 flex justify-between items-center gap-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <span className="font-medium">{project.domain}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <Users size={16} className="text-green-400" />
            <span className="font-medium">
              {project._count.SubmittedProjects} completions
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}