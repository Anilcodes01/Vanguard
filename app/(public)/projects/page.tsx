"use client"
import { useEffect, useState } from 'react';
import ProjectCard from '@/app/components/Landing/Projects/ProjectsCard';
import { Lock } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

type ApiResponse = {
  projects: Project[];
};

export default function ProjectsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/projects/getAllProjects'); 
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result: ApiResponse = await response.json();
        setData(result);
      } catch (error) { 
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#262626] p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#262626]/20 backdrop-blur-xs rounded-lg">
        <div className="flex flex-col items-center gap-4 text-white">
          <Lock className="w-16 h-16 text-neutral-400" />
          <h2 className="text-4xl font-bold tracking-wider">Coming Soon</h2>
          <p className="text-neutral-400">This page is under construction. Please check back later!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Projects</h1>
        
        {loading && (
          <div className="text-center text-white text-lg">Loading projects...</div>
        )}

        {error && (
           <div className="text-center text-red-400 text-lg">Error: {error}</div>
        )}

        {!loading && !error && (!data || !data.projects || data.projects.length === 0) && (
          <div className="text-center text-neutral-400 text-lg">No projects found.</div>
        )}

        {data?.projects && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {data.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};