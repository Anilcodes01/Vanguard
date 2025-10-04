'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Editor from '@monaco-editor/react';

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


export default function ProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string>('');
  
  const [output, setOutput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!problemId) {
      setIsLoading(false);
      return;
    }

    const fetchProblem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ProblemDetails>(`/api/problems/${problemId}`);
        setProblem(response.data);
        setCode(response.data.starter_code); 
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch problem data.');
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput('Submitting your code...');
    console.log("Submitting the following code for problem:", problemId);
    console.log(code);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setOutput(`Submission complete!\nYour code:\n\n${code}`);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Problem...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }
  if (!problem) {
    return <div className="flex justify-center items-center h-screen">Problem not found.</div>;
  }

  const difficultyStyles = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex h-screen text-black overflow-hidden bg-gray-100">
      
      <div className="w-1/2 p-6 overflow-y-auto bg-white">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${difficultyStyles[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
        
        <div className="prose max-w-none mt-6">
          <p>{problem.description}</p>
        </div>

        <div className="mt-6">
          {problem.examples.map((example, index) => (
            <div key={example.id} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Example {index + 1}</h3>
              <p className="font-mono text-sm">
                <strong className="font-semibold">Input:</strong> {example.input}
              </p>
              <p className="font-mono text-sm">
                <strong className="font-semibold">Output:</strong> {example.output}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 flex flex-col bg-gray-800">
        <div className="flex-grow">
          <Editor
            height="100%" 
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
        </div>
        
        <div className="flex-shrink-0 h-48 bg-[#1e1e1e] p-4 flex flex-col">
           <div className="flex justify-end mb-2">
             <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500 transition-colors"
             >
               {isSubmitting ? 'Running...' : 'Submit'}
             </button>
           </div>
           <div className="flex-grow bg-black rounded-md p-2 text-white font-mono text-sm overflow-y-auto">
             <pre>{output || 'Click "Submit" to run your code against test cases.'}</pre>
           </div>
        </div>
      </div>

    </div>
  );
}