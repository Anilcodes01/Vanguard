import Image from "next/image";
import { Clock, Users, Tag } from "lucide-react";
import ProjectSidebar from "@/app/components/Projects/ProjectSidebar";
import { ProjectStatus } from "@/types";

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  completionCount: number;
};

type ProjectDetailsProps = {
  project: Project;
  projectStatus: ProjectStatus;
  timeLeft: string;
  isStarting: boolean;
  handleStartProject: () => void;
  handleOpenSubmitModal: () => void;
};

export default function ProjectDetails({
  project,
  projectStatus,
  timeLeft,
  isStarting,
  handleStartProject,
  handleOpenSubmitModal,
}: ProjectDetailsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
      <div className="lg:w-2/3">
        <div className="h-full w-full bg-white rounded-xl overflow-hidden ring-1 ring-gray-200">
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
      </div>

      <div className="lg:w-1/3 flex flex-col gap-8">
        <div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-400" />
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
          <h2 className="text-xl mt-6 font-semibold text-black mb-2">
            Project Description
          </h2>
          <div className="prose prose-p:text-gray-600 prose-p:leading-relaxed whitespace-pre-wrap">
            {project.description}
          </div>
        </div>

        <ProjectSidebar
          project={project}
          projectStatus={projectStatus}
          timeLeft={timeLeft}
          isStarting={isStarting}
          handleStartProject={handleStartProject}
          handleOpenSubmitModal={handleOpenSubmitModal}
        />
      </div>
    </div>
  );
}