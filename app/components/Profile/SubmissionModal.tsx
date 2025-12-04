"use client";

import { useEffect, useState } from "react";
import { X, Clock, Cpu, Copy, Check, FileCode } from "lucide-react";
import { fetchSubmissionDetails } from "@/app/actions/ProfileActions";

interface SubmissionModalProps {
  submissionId: string;
  onClose: () => void;
}

interface SubmissionDetails {
  id: string;
  code: string;
  language: string;
  status: string;
  executionTime: number | null;
  executionMemory: number | null;
  createdAt: string;
  problem: {
    title: string;
  };
}

export function SubmissionModal({
  submissionId,
  onClose,
}: SubmissionModalProps) {
  const [data, setData] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const details = await fetchSubmissionDetails(submissionId);

        setData(details);
      } catch (error) {
        console.error("Failed to load submission", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [submissionId]);

  const handleCopy = () => {
    if (data?.code) {
      navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!submissionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="space-y-1">
            {loading ? (
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">
                {data?.problem.title}
              </h2>
            )}

            {loading ? (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2" />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-medium ${
                    data?.status === "Accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {data?.status}
                </span>
                <span className="text-gray-400 text-sm">
                  Submitted at {new Date(data!.createdAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-24 flex-1 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-24 flex-1 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Runtime
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data?.executionTime
                      ? (data.executionTime * 1000).toFixed(2)
                      : "N/A"}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ms
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Cpu size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Memory
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data?.executionMemory
                      ? (data.executionMemory / 1024).toFixed(2)
                      : "N/A"}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      MB
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <FileCode size={16} />
                    <span className="capitalize">{data?.language}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? "Copied" : "Copy Code"}
                  </button>
                </div>

                <div className="relative bg-white p-4 overflow-x-auto">
                  <pre className="font-mono text-sm leading-6 tab-4">
                    <code className="block min-w-full">
                      {data?.code.split("\n").map((line, i) => (
                        <div key={i} className="table-row">
                          <span className="table-cell text-right pr-4 select-none text-gray-300 w-8 text-xs">
                            {i + 1}
                          </span>
                          <span className="table-cell whitespace-pre text-gray-800">
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
