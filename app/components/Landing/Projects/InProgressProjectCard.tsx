"use client";

import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import ProjectStatusTimer from "./ProjectStatusTimer";
import { InProgressProject } from "@/types";

interface InProgressProjectCardProps {
  project: InProgressProject;
}

function InProgressProjectCard({ project }: InProgressProjectCardProps) {
  if (project.isInternship) {
    const percentage =
      project.totalTasks && project.totalTasks > 0
        ? Math.round(((project.progress || 0) / project.totalTasks) * 100)
        : 0;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {}
          <div className="hidden md:block w-1.5 bg-[#f59120] self-stretch" />

          <div className="p-6 w-full flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex-1 space-y-3">
              {}
              <div className="flex items-center gap-2">
                <span className="bg-[#f59120]/10 text-[#f59120] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Week {project.weekNumber}
                </span>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                  <Code2 size={10} /> Internship
                </span>
              </div>

              {}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-2xl">
                  {project.description}
                </p>
              </div>

              {}
              <div className="w-full max-w-sm pt-2">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-gray-400">
                    Weekly Tasks
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {percentage}% Complete
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59120] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
              {project.startedAt && (
                <span className="text-[10px] text-gray-400 font-mono hidden md:block">
                  Started {new Date(project.startedAt).toLocaleDateString()}
                </span>
              )}
              <Link
                href={`/internship/${project.weekNumber}`}
                className="w-full md:w-auto"
              >
                <button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  Continue
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {}
        <div className="relative w-full sm:w-40 h-40 sm:h-28 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          <Image
            src={project.coverImage || "/placeholder-project.png"}
            alt={project.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>

        {}
        <div className="flex-1 flex flex-col justify-between self-stretch w-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {project.domain}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          </div>

          {}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            {project.startedAt ? (
              <ProjectStatusTimer
                startedAt={project.startedAt}
                maxTime={project.maxTime || "0"}
              />
            ) : (
              <div />
            )}

            <Link href={`/projects/${project.id}`}>
              <button className="text-gray-900 hover:text-orange-600 font-bold text-sm flex items-center gap-1 transition-colors">
                Resume Project <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(InProgressProjectCard);
