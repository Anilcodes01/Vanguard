"use client"; 

import { useState, useEffect } from 'react';
import ProjectCard from './Projects/ProjectsCard';
import FullProjectCardSkeleton from './Projects/ProjectCardSkeleton';

type UserProfile = {
  name: string | null;
  username: string | null;
  domain: string | null;
};

type Project = {
  id: string;
  name: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function UserLoggedInLanding() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/projects/getProjects');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const data = await response.json();
        setUserProfile(data.userProfile);
        setProjects(data.projects);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  if (loading) {
    return (
      <FullProjectCardSkeleton />
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#262626] text-white'>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center min-h-screen bg-[#262626] text-white p-8'>
      <div className="text-start w-full max-w-6xl mb-12">
        <h1 className="text-4xl font-bold">Welcome, {userProfile?.name} 👋</h1>
      </div>
      
      <div className='w-full max-w-6xl'>
        <h2 className='text-2xl font-semibold mb-6'>
          Projects
        </h2>
        
        {projects.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className='bg-[#3b3b3b] p-8 rounded-lg text-center'>
            <p className='text-gray-300'>No projects found for your domain right now. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}