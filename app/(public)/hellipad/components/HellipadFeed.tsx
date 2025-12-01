"use client";

import React, { useState } from "react";
import HellipadCard from "./HellipadCard";
import HellipadModal from "./HellipadModal";
import { ProjectData } from "../types";

interface HellipadFeedProps {
  projects: ProjectData[];
}

export default function HellipadFeed({ projects }: HellipadFeedProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        {projects.map((project) => (
          <HellipadCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}

        {projects.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400">No projects submitted yet.</p>
          </div>
        )}
      </div>

      <HellipadModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </>
  );
}