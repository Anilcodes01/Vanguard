"use client";

import { FolderGit2, Link as LinkIcon, Briefcase } from "lucide-react";

type SubmittedProject = {
  id: string;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
  project: {
    name: string;
  };
};

interface SubmittedProjectsListProps {
  projects: SubmittedProject[];
}

export default function SubmittedProjectsList({ projects }: SubmittedProjectsListProps) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl">
      <div className="p-6 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-100">
          Submitted Projects
        </h2>
      </div>
      {projects.length > 0 ? (
        <div className="divide-y divide-neutral-800">
          {projects.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-2 sm:grid-cols-3 items-center p-4 gap-4"
            >
              <p className="text-neutral-200 font-medium truncate col-span-2 sm:col-span-1">
                {item.project.name}
              </p>

              <p className="hidden sm:block text-neutral-500 text-sm">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <div className="flex justify-end items-center gap-3">
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors"
                    title="View GitHub Repository"
                  >
                    <FolderGit2 size={20} />
                  </a>
                )}
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-sky-400 transition-colors"
                    title="View Live Site"
                  >
                    <LinkIcon size={20} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="mx-auto text-neutral-700 mb-3" size={40} />
          <p className="text-neutral-500">
            This user hasn&apos;t submitted any projects yet.
          </p>
        </div>
      )}
    </div>
  );
}