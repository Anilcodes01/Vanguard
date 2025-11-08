import Image from "next/image";
import { Clock, Users, Tag } from "lucide-react";

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
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">{project.domain}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {project.maxTime} days to complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {project.completionCount} student
              {project.completionCount !== 1 ? "s" : ""} completed
            </span>
          </div>
        </div>
      </div>

      <div className="aspect-video w-full bg-gray-800 rounded-xl overflow-hidden ring-1 ring-white/10">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.name}
            width={1280}
            height={720}
            className="object-cover w-full h-full"
          />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">
          Project Description
        </h2>
        <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed whitespace-pre-wrap">
          {project.description}
        </div>
      </div>
    </div>
  );
}