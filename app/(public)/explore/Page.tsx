

'use client';

import React, { useEffect, useState } from 'react';
import ProjectCard from '@/app/components/explore/ProjectCard';
import ProblemCard from '@/app/components/explore/ProblemCard';
import { Difficulty } from '@prisma/client'; 
import { LoadingSpinner } from '@/app/components/Profile/ProfilePanel';

interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  _count: {
    SubmittedProjects: number;
  };
}

interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string[];
  _count: {
    solutions: number;
  };
}

export default function ExplorePage() {
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const [topProblems, setTopProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, problemsResponse] = await Promise.all([
          fetch('/api/projects/topProjects'),
          fetch('/api/problems/topProblems'),
        ]);

        if (!projectsResponse.ok || !problemsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const projectsData = await projectsResponse.json();
        const problemsData = await problemsResponse.json();

        setTopProjects(projectsData);
        setTopProblems(problemsData);
      } catch (error) {
        console.error('Error fetching explore page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#262626]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262626] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-100">
            Explore Community Highlights
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Discover the most popular projects and challenging problems tackled by our community.
          </p>
        </div>

        <>
          <section id="top-projects" className="mb-20">
            <h2 className="text-3xl font-bold text-gray-200 mb-8 text-center sm:text-left">
              Most Popular Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {topProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          <section id="top-problems">
            <h2 className="text-3xl font-bold text-gray-200 mb-8 text-center sm:text-left">
              Most Solved Problems
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {topProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </section>
        </>
      </div>
    </div>
  );
}