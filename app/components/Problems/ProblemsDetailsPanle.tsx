
import React from 'react';

type Example = {
  id: number;
  input: string;
  output: string;
};

type ProblemDetails = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  starter_code: string;
  examples: Example[];
};

interface ProblemDetailsPanelProps {
  problem: ProblemDetails;
}

const difficultyStyles = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
};

export default function ProblemDetailsPanel({ problem }: ProblemDetailsPanelProps) {
  return (
    <div className="w-1/2 p-6 rounded-lg overflow-y-auto bg-[#262626]">
      <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${
          difficultyStyles[problem.difficulty]
        }`}
      >
        {problem.difficulty}
      </span>
      <div
        className="prose max-w-none text-white mt-6"
        dangerouslySetInnerHTML={{ __html: problem.description }}
      />
      <div className="mt-6 text-black">
        {problem.examples.map((example, index) => (
          <div
            key={example.id}
            className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200"
          >
            <h3 className="font-semibold text-black mb-2">
              Example {index + 1}
            </h3>
            <p className="font-mono text-black text-sm">
              <strong className="font-semibold">Input:</strong> {example.input}
            </p>
            <p className="font-mono text-sm">
              <strong className="font-semibold">Output:</strong> {example.output}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}