"use client";

import InternshipProjectCard from "./InternshipProjectCard";
import { InternshipProjectCardProps } from "./InternshipProjectCard";
import { useState, useEffect } from "react";
import axios from "axios";

type ProjectData = {
  id: string;
  title: string;
  description: string;
  caseStudy: string;
  techStack: string[];
  maxTime: string;
  userId: string;
};

export default function InternshipProj() {
  const [projects, setProjects] = useState<InternshipProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/internship/getProjects");
        const mappedProjects = response.data.map((project: ProjectData) => ({
          ...project,
          coverImage: "",
        }));
        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 max-w-7xl lg:grid-cols-3 gap-12">
      {projects.map((project) => (
        <InternshipProjectCard key={project.title} project={project} />
      ))}
    </div>
  );
}