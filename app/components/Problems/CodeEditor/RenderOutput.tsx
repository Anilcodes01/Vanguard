import { SubmissionResult } from "@/types/index";

export const RenderOutput = ({ result }: { result: SubmissionResult | null }) => {
  if (!result) {
    return (
      <div className="p-4">
        <pre className="text-gray-400">
          Click &quot;Start&quot; to begin coding. Run or submit your code to see the result.
        </pre>
      </div>
    );
  }

  if (result.status === "Accepted") {
    return <div className="p-4 text-green-400 font-bold">✅ Accepted!</div>;
  }

  return (
    <div className="p-4 text-sm font-mono">
      <p className="font-bold text-red-400">❌ {result.status}</p>
      {result.details && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="font-semibold text-gray-300 mb-1">Error Details:</p>
          <pre className="whitespace-pre-wrap text-red-300">{result.details}</pre>
        </div>
      )}
      {result.input !== undefined && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg space-y-3">
          <div>
            <p className="font-semibold text-gray-300">Input:</p>
            <pre className="whitespace-pre-wrap text-gray-200">{result.input}</pre>
          </div>
          <div>
            <p className="font-semibold text-gray-300">Your Output:</p>
            <pre className="whitespace-pre-wrap text-red-300">{result.userOutput || '""'}</pre>
          </div>
          <div>
            <p className="font-semibold text-gray-300">Expected:</p>
            <pre className="whitespace-pre-wrap text-green-300">{result.expectedOutput || '""'}</pre>
          </div>
        </div>
      )}
    </div>
  );
};