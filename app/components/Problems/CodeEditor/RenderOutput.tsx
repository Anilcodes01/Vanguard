import { SubmissionResult } from "@/types";
import { Clock, Cpu, CheckCircle, XCircle } from "lucide-react";
import React from "react";

interface StatCardProps {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string;
  colorClass: string;
}

const StatCard = ({ icon: Icon, label, value, colorClass }: StatCardProps) => (
  <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
    <Icon className={`w-5 h-5 ${colorClass}`} />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  </div>
);

export const RenderOutput = ({ result }: { result: SubmissionResult | null }) => {
  if (!result) {
    return (
      <div className="p-4 text-center text-gray-500">
        Run or submit your code to see the results.
      </div>
    );
  }

  const isAccepted = result.status === 'Accepted';
  const isError = result.status === 'Error';

  return (
    <div className="p-4 space-y-4 text-black overflow-y-auto h-full">
      <div className="flex items-center gap-3">
        {isAccepted ? (
          <CheckCircle className="text-orange-400" size={24} />
        ) : (
          <XCircle className="text-red-400" size={24} />
        )}
        <h3 className={`text-xl font-bold ${isAccepted ? 'text-orange-400' : 'text-red-400'}`}>
          {result.status}
        </h3>
      </div>
      
      {(result.executionTime != null && result.executionMemory != null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <StatCard 
            icon={Clock} 
            label="Runtime" 
            value={`${(result.executionTime * 1000).toFixed(0)} ms`}
            colorClass="text-orange-400"
          />
          <StatCard 
            icon={Cpu} 
            label="Memory" 
            value={`${result.executionMemory} KB`}
            colorClass="text-purple-400"
          />
        </div>
      )}

      {isError && <p className="text-sm text-red-600 bg-red-100/10 p-3 rounded-lg">{result.message}</p>}

      {!isAccepted && !isError && (
        <div className="space-y-3 text-sm font-mono">
          {result.input && (
            <div>
              <p className="font-sans font-semibold text-gray-500 mb-1">Input:</p>
              <pre className="bg-gray-100 p-2 rounded text-gray-600 whitespace-pre-wrap">{result.input}</pre>
            </div>
          )}
          {result.userOutput && (
            <div>
              <p className="font-sans font-semibold text-gray-500 mb-1">Your Output:</p>
              <pre className="bg-gray-100 p-2 rounded text-gray-600 whitespace-pre-wrap">{result.userOutput}</pre>
            </div>
          )}
          {result.expectedOutput && (
            <div>
              <p className="font-sans font-semibold text-gray-500 mb-1">Expected Output:</p>
              <pre className="bg-gray-100 p-2 rounded text-gray-600 whitespace-pre-wrap">{result.expectedOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};