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

const loadingStates = [
  { emoji: "🚀", text: "Launching project ideas..." },
  { emoji: "🔍", text: "Searching for innovative projects..." },
  { emoji: "⚡", text: "Generating creative concepts..." },
  { emoji: "🎯", text: "Tailoring projects to your interests..." },
];

export default function InternshipProj() {
  const [projects, setProjects] = useState<InternshipProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLoadingState, setCurrentLoadingState] = useState(0);

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

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentLoadingState((prev) => (prev + 1) % loadingStates.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 flex-col space-y-4">
        <div className="text-4xl animate-bounce">
          {loadingStates[currentLoadingState].emoji}
        </div>
        <p className="text-gray-400 text-center">
          {loadingStates[currentLoadingState].text}
        </p>
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