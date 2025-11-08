// components/ProjectDetails.tsx
import Image from "next/image";
import { Clock, Users, ImageIcon } from "lucide-react";

type Project = {
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  completionCount: number;
};

type ProjectDetailsProps = {
  project: Project;
};

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="lg:col-span-3">
      <div className="relative aspect-video w-full bg-[#333] rounded-lg overflow-hidden mb-6 border border-neutral-700">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-neutral-800">
            <ImageIcon className="w-16 h-16 text-neutral-600" />
          </div>
        )}
      </div>
      <div className="bg-[#333] rounded-lg p-6 border border-neutral-700">
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 mb-4">
          <span className="border border-gray-600 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {project.domain}
          </span>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4" />
            <span>{project.maxTime} days to complete</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4" />
            <span>
              {project.completionCount} student
              {project.completionCount !== 1 ? "s" : ""} completed
            </span>
          </div>
        </div>
        <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
          {project.description}
        </p>
      </div>
    </div>
  );
}