'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@/app/utils/supabase/client';

type Example = {
  input: string;
  output: string;
};

type TestCase = {
  input: string;
  expected: string;
};

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  min_time: number;
  max_time: number;
  starter_code: string;
  examples: Example[];
  test_cases: TestCase[];
};

export default function UploadProblems() {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonContent(content);
        const parsedData = JSON.parse(content);
        if (Array.isArray(parsedData)) {
          setProblems(parsedData);
          setError(null);
        } else {
          setError('Invalid JSON format. The file must contain an array of problems.');
          setProblems([]);
        }
      } catch (err) {
        setError('Failed to parse JSON. Please check the file for syntax errors.');
        setProblems([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (problems.length === 0) {
      setError('No problems to upload. Please select a valid file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();
    let uploadedCount = 0;

    for (const problem of problems) {
      try {
        const { examples, test_cases, ...problemData } = problem;

        const { error: problemError } = await supabase
          .from('problems')
          .insert([problemData]);

        if (problemError) {
          throw new Error(`Failed to insert problem "${problem.id}": ${problemError.message}`);
        }

        const examplesToInsert = examples.map(ex => ({
          ...ex,
          problemId: problem.id,
        }));
        
        const { error: examplesError } = await supabase
          .from('examples')
          .insert(examplesToInsert);

        if (examplesError) {
          throw new Error(`Failed to insert examples for problem "${problem.id}": ${examplesError.message}`);
        }

        const testCasesToInsert = test_cases.map(tc => ({
          ...tc,
          problemId: problem.id,
        }));

        const { error: testCasesError } = await supabase
          .from('test_cases')
          .insert(testCasesToInsert);
        
        if (testCasesError) {
            throw new Error(`Failed to insert test cases for problem "${problem.id}": ${testCasesError.message}`);
        }

        uploadedCount++;
     } catch (err) {
  let message = 'An unknown error occurred.';
  if (err instanceof Error) {
    message = err.message;
  }

  setError(`An error occurred during upload: ${message}. ${uploadedCount} problems were uploaded before the error.`);
  setIsLoading(false);
  return;
}

    }

    setSuccessMessage(`Successfully uploaded ${uploadedCount} problems to the database!`);
    setIsLoading(false);
    setJsonContent('');
    setProblems([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload Problems</h1>
        <p className="text-gray-600 mb-6 text-center">
          Select a .json or .txt file containing an array of problems to upload them to the database.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Problems File (.json or .txt)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {jsonContent && (
            <div>
              <label htmlFor="json-preview" className="block text-sm font-medium text-gray-700 mb-1">
                File Content Preview ({problems.length} problems found)
              </label>
              <textarea
                id="json-preview"
                readOnly
                value={jsonContent}
                className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || problems.length === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Uploading...' : 'Upload to Database'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <p className="font-bold">Success:</p>
            <p>{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}