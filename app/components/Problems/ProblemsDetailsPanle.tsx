import { Tag, ChevronDown, CheckCircle2, Edit3 } from 'lucide-react';
import { SolutionStatus } from '@prisma/client';
import React, { useState } from 'react';
import { ProblemDetails } from '@/types';


interface ProblemDetailsPanelProps {
  problem: ProblemDetails;
}

const difficultyStyles = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
};

export default function ProblemDetailsPanel({ problem }: ProblemDetailsPanelProps) {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);

  const renderStatusBadge = () => {
    if (!problem.solutionStatus) return null;

    if (problem.solutionStatus === 'Solved') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={14} />
          Solved
        </span>
      );
    }

    if (problem.solutionStatus === 'Attempted') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-sky-500/10 text-sky-400">
          <Edit3 size={14} />
          Attempted
        </span>
      );
    }

    return null;
  };


  return (
    <div className="w-1/2 p-6 flex flex-col gap-4 shadow-2xl rounded-lg overflow-y-auto bg-[#262626]">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold text-white mb-2">{problem.title}</h1>
        <div className="flex gap-4 items-center">
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              difficultyStyles[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </span>
             {renderStatusBadge()}
        </div>
      </div>

      <div
        className="prose prose-invert max-w-none text-gray-300 mt-6"
        dangerouslySetInnerHTML={{ __html: problem.description }}
      />

      <div className="mt-6 flex flex-col gap-8">
        {problem.examples.map((example, index) => (
          <div key={example.id} className="rounded-lg mb-4">
            <h3 className="font-semibold text-white mb-2">
              Example {index + 1}
            </h3>
          <div className='flex flex-col gap-2'>
              <p className="font-mono text-gray-300 text-sm">
              <strong className="font-semibold text-white">Input:</strong>{' '}
              {example.input}
            </p>
            <p className="font-mono text-sm text-gray-300">
              <strong className="font-semibold text-white">Output:</strong>{' '}
              {example.output}
            </p>
          </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-700 pt-6">
        <button
          onClick={() => setIsTopicsOpen(!isTopicsOpen)}
          className="flex items-center justify-between w-full text-left text-white hover:cursor-pointer p-2 rounded-md"
          aria-expanded={isTopicsOpen}
        >
          <div className="flex items-center gap-2">
            <Tag size={18} />
            <h3 className="font-semibold">Topics</h3>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${
              isTopicsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`
            overflow-hidden 
            transition-[max-height,opacity] 
            duration-300 
            ease-in-out
            ${isTopicsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="mt-4 pl-2 flex flex-wrap gap-2">
            {problem.topic.map((topic, index) => (
              <span
                key={index}
                className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}