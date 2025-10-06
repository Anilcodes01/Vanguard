// app/problems/[problemId]/CodeEditorPanel.tsx

import React from 'react';
import Editor from '@monaco-editor/react';

// Import icons
import { VscCode } from 'react-icons/vsc';
import { FiMaximize, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { BsCheck2Circle } from 'react-icons/bs';

type SubmissionResult = {
  status: 'Accepted' | 'Wrong Answer' | 'Error';
  message?: string;
  details?: string;
  input?: string;
  userOutput?: string;
  expectedOutput?: string;
};

interface CodeEditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
}

// Header for the code editor widget
const EditorHeader = () => (
  <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
    <div className="flex items-center gap-4">
      <VscCode className="text-gray-400" />
      <span className="text-sm font-medium text-gray-200">Code</span>
      <div className="text-sm text-gray-300 bg-zinc-700 px-2 py-0.5 rounded">
        JavaScript
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="text-gray-400 hover:text-white"><FiRefreshCw size={16} /></button>
      <button className="text-gray-400 hover:text-white"><FiSettings size={16} /></button>
      <button className="text-gray-400 hover:text-white"><FiMaximize size={16} /></button>
    </div>
  </div>
);

// Renders the output in the results panel
const RenderOutput = ({ submissionResult }: { submissionResult: SubmissionResult | null }) => {
  if (!submissionResult) {
   return <pre className="text-gray-400">Click &quot;Submit&quot; to run your code against the test cases.</pre>;
  }

  switch (submissionResult.status) {
    case 'Accepted':
      return <div className="text-green-400">✅ Accepted! All test cases passed.</div>;
    case 'Wrong Answer':
      return (
        <div>
          <p className="text-red-400 font-bold">❌ Wrong Answer</p>
          <div className="mt-2 p-3 bg-black/50 rounded-lg">
            <p><strong className="text-gray-400">Input:</strong></p>
            <pre className="whitespace-pre-wrap">{submissionResult.input}</pre>
            <p className="mt-2"><strong className="text-gray-400">Your Output:</strong></p>
            <pre className="whitespace-pre-wrap text-red-500">{submissionResult.userOutput}</pre>
            <p className="mt-2"><strong className="text-gray-400">Expected Output:</strong></p>
            <pre className="whitespace-pre-wrap text-green-500">{submissionResult.expectedOutput}</pre>
          </div>
        </div>
      );
    case 'Error':
      return (
        <div>
          <p className="text-red-400 font-bold">❌ {submissionResult.message || 'Submission Error'}</p>
          {submissionResult.details && (
            <div className="mt-2 p-3 bg-black/50 rounded-lg">
              <pre className="whitespace-pre-wrap">{submissionResult.details}</pre>
            </div>
          )}
        </div>
      );
    default:
      return <pre>An unexpected result was received.</pre>;
  }
};


export default function CodeEditorPanel({
  code,
  setCode,
  handleSubmit,
  isSubmitting,
  submissionResult,
}: CodeEditorPanelProps) {

  return (
    <div className="w-1/2 flex flex-col p- gap-4 ">
      {/* Main Code Editor Widget */}
      <div className="bg-zinc-900 rounded-lg shadow-2xl flex flex-col flex-grow overflow-hidden">
        <EditorHeader />
        <div className="flex-grow relative">
           <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 10 }
              }}
           />
        </div>
        <div className="flex justify-between items-center px-4 py-1 bg-zinc-800 border-t border-zinc-700 text-xs text-gray-400">
            <span>Saved</span>
            <span>Ln 1, Col 1</span>
        </div>
      </div>

      {/* Results Panel Widget */}
      <div className="flex-shrink-0 bg-zinc-900 rounded-lg shadow-2xl flex flex-col h-56">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
            <div className="flex items-center gap-2 text-green-400">
                <BsCheck2Circle />
                <span className="text-sm font-medium">Testcase</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
            >
              {isSubmitting ? "Running..." : "Submit"}
            </button>
        </div>
        <div className="flex-grow p-4 text-white font-mono text-sm overflow-y-auto">
            <RenderOutput submissionResult={submissionResult} />
        </div>
      </div>
    </div>
  );
}