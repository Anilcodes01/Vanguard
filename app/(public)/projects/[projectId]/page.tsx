"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Github, Link as LinkIcon, Loader2, Send, Clock, ImageIcon } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

type SubmissionStatus = {
  message: string | null;
  type: 'success' | 'error' | null;
};

export default function IndividualProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    message: null,
    type: null,
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data: Project = await response.json();
        setProject(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ message: null, type: null });

    try {
      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, githubUrl, liveUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit project.');
      }

      setSubmissionStatus({ message: result.message, type: 'success' });
      setGithubUrl('');
      setLiveUrl('');
    } catch (err) {
      if (err instanceof Error) {
        setSubmissionStatus({ message: err.message, type: 'error' });
      } else {
        setSubmissionStatus({ message: "An unknown error occurred.", type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-white">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-neutral-400">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#262626] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative aspect-video w-full bg-[#333] rounded-lg overflow-hidden mb-6 border border-neutral-700">
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-neutral-800">
                <ImageIcon className="w-16 h-16 text-neutral-600" />
              </div>
            )}
          </div>

          <div className="bg-[#333] rounded-lg p-6 border border-neutral-700">
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 mb-4">
              <span className="border border-gray-500 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{project.domain}</span>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" />
                <span>{project.maxTime} days to complete</span>
              </div>
            </div>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-[#333] rounded-lg p-6 border border-neutral-700 lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold mb-1">Submit Your Work</h2>
            <p className="text-neutral-400 text-sm mb-6">Ready to show your skills? Submit your project links below.</p>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-neutral-300 mb-1">
                    GitHub Repository URL*
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Github className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder:text-gray-400  sm:text-sm"
                      placeholder="https://github.com/user/repo"
                      required
                    />
                  </div>
                   <p className="mt-1 text-xs text-neutral-500">Make sure your repository is public.</p>
                </div>

                <div>
                  <label htmlFor="liveUrl" className="block text-sm font-medium text-neutral-300 mb-1">
                    Live Deployed URL (Optional)
                  </label>
                  <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="liveUrl"
                      name="liveUrl"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder:text-gray-400  sm:text-sm"
                      placeholder="https://my-project.vercel.app"
                    />
                  </div>
                   <p className="mt-1 text-xs text-neutral-500">Your hosted project on Vercel, Netlify, etc.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !githubUrl}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                     <>
                      <Send className="h-4 w-4" />
                      Submit Project
                     </>
                  )}
                </button>
                {submissionStatus.message && (
                   <p className={`text-sm text-center sm:text-left ${submissionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                     {submissionStatus.message}
                   </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}