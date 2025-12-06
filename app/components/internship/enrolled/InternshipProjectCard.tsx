"use client";

import { Layers, Clock } from "lucide-react";
import Link from "next/link";

export type InternshipProjectCardProps = {
  id: string
  title: string;
  description: string;
  techStack: string[];
  maxTime: string;
};


export default function InternshipProjectCard({
  project,
}: {
  project: InternshipProjectCardProps;
  priority?: boolean;
}) {

  console.log('Project data: ', project)
  return (
    <div className="group flex flex-col cursor-pointer h-full bg-white rounded-2xl overflow-hidden border  shadow-lg shadow-black/20  hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
     

    <Link href={`/internship/${project.id}`}>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-black truncate mb-2">
          {project.title}
        </h3>

        <p className="text-sm text-black line-clamp-3 mb-4">
          {project.description}
        </p>

        <div className="mt-auto pt-4 border-t  flex justify-between items-center gap-4 text-xs text-black">
          <span className="inline-flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <span className="font-medium">
              {project.techStack.length > 0 ? project.techStack[0] : "General"}
            </span>
          </span>

          <span className="inline-flex items-center gap-2">
            <Clock size={16} className="text-green-400" />
            <span>{project.maxTime}</span>
          </span>
        </div>
      </div></Link>
    </div>
  );
}