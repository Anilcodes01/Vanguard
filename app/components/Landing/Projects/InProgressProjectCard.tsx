"use-client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProjectStatusTimer from "./ProjectStatusTimer";
import { InProgressProject } from "@/app/store/features/projects/inProgressSlice";
import Image from "next/image";
import { memo } from "react";

interface InProgressProjectCardProps {
  project: InProgressProject;
}

function InProgressProjectCard({
  project,
}: InProgressProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300"
    >
      <div className="flex flex-col sm:flex-row items-start gap-5 w-full">
        <div className="relative w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden">
          <Image
            src={project.coverImage!}
            alt={project.name}
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div>
            <h3 className="text-lg font-bold text-black">{project.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1 mb-3">
              {project.description}
            </p>
            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {project.domain}
            </span>
          </div>

          <div className="flex items-center gap-6 w-full justify-between shrink-0 mt-4">
            {project.startedAt && (
              <ProjectStatusTimer
                startedAt={project.startedAt}
                maxTime={project.maxTime}
              />
            )}

            <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700">
              <span>Continue</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(InProgressProjectCard);