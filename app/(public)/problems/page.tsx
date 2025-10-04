'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios'; 

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
      const response = await axios.get<ApiResponse>('/api/problems/list', {
        params: { page },
      });

      const { problems: newProblems, totalCount } = response.data;

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
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch problems.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
    } finally {
        if (isMounted) {
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


  return (
    <div className="bg-white text-black min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">

        {error && page === 1 && (
            <div className="flex items-center justify-center p-8 bg-red-50 text-red-600 rounded-lg">
                <h1>Error: {error}</h1>
            </div>
        )}

        <div className=" rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between bg-gray-50 p-4 font-semibold text-gray-600 text-sm">
            <div className="w-4/5">TITLE</div>
            <div className="w-1/5 text-right">DIFFICULTY</div>
          </div>
          <ul className="divide-y divide-gray-200">
            {problems.map(problem => (
              <li key={problem.id}>
                <Link key={problem.id} href={`/problems/${problem.id}`} className="block hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <p className="font-medium text-gray-900 truncate">{problem.title}</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      problem.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMoreProblems}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {error && page > 1 && (
            <div className="mt-4 text-center text-sm text-red-600">
                <p>Failed to load more problems. Please try again.</p>
            </div>
        )}
      </div>
    </div>
  );
}