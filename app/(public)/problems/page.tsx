'use client';

import { useState, useEffect } from 'react';

type Problem = {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

interface ApiResponse {
  problems: Problem[];
  totalCount: number;
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; 

    const fetchProblems = async () => {
      setIsLoading(true); 
      setError(null);

      try {
        const response = await fetch(`/api/problems/list?page=${page}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch problems');
        }

        const data: ApiResponse = await response.json();
        const { problems: newProblems, totalCount } = data;

        if (isMounted) {
          setProblems(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewProblems = newProblems.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProblems];
          });
          
          const totalFetched = (problems.length + newProblems.length);
          if (totalFetched >= totalCount) {
            setHasMore(false);
          }
        }

      } catch (err) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, [page, problems.length]); 

  const loadMoreProblems = () => {
    setPage(prevPage => prevPage + 1);
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch(difficulty) {
      case 'Beginner':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Intermediate':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Advanced':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-16">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Practice Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Sharpen your skills with curated coding challenges
          </p>
        </div>

        {error && page === 1 ? (
          <div className="flex items-center justify-center p-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {problems.map((problem, index) => (
                <a 
                  key={problem.id} 
                  href={`/problems/${problem.id}`}
                  className="group block"
                >
                  <div className="relative bg-[#151515] border border-gray-800 rounded-xl p-5 transition-all duration-300 hover:bg-[#1a1a1a] hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 text-sm font-medium group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                          {index + 1}
                        </div>
                        <h3 className="text-white font-medium text-lg group-hover:text-blue-400 transition-colors truncate">
                          {problem.title}
                        </h3>
                      </div>
                      
                      <span className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border ${getDifficultyStyles(problem.difficulty)} transition-all duration-300`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {isLoading && page === 1 && (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-sm">Loading problems...</p>
                </div>
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreProblems}
                  disabled={isLoading}
                  className="group relative px-8 py-3 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Loading...' : 'Load More'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}

            {!hasMore && problems.length > 0 && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/30 border border-gray-800 rounded-full text-gray-400 text-sm">
                  <span>✨</span>
                  <span>You&apos;ve reached the end</span>
                </div>
              </div>
            )}

            {error && page > 1 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-sm">
                  <span>⚠️</span>
                  <span>Failed to load more problems. Please try again.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}