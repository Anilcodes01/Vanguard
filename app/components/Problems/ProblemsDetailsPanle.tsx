import { Tag, ChevronDown, CheckCircle2, Edit3 } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProblemDetails } from "@/types";

interface ProblemDetailsPanelProps {
  problem: ProblemDetails;
}

const difficultyStyles = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

export default function ProblemDetailsPanel({
  problem,
}: ProblemDetailsPanelProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const renderStatusBadge = () => {
    if (!problem.solutionStatus) return null;

    if (problem.solutionStatus === "Solved") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-[#f59120]/10 text-orange-400">
          <CheckCircle2 size={14} />
          Solved
        </span>
      );
    }

    if (problem.solutionStatus === "Attempted") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-sky-500/10 text-sky-400">
          <Edit3 size={14} />
          Attempted
        </span>
      );
    }

    return null;
  };

  const diffStyle =
    difficultyStyles[problem.difficulty] || difficultyStyles.EASY;

  return (
    <div className="w-full p-4 lg:p-6 flex flex-col gap-4 rounded-lg lg:overflow-y-auto bg-white">
      {}
      <div className="flex flex-col border-b border-gray-100 pb-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-3">
          {problem.title}
        </h1>
        <div className="flex gap-4 items-center flex-wrap">
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${diffStyle}`}
          >
            {problem.difficulty}
          </span>
          {renderStatusBadge()}
        </div>
      </div>

      {}
      <div className="text-gray-800 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-2xl font-bold mt-6 mb-4 text-black"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-xl font-bold mt-6 mb-3 text-black"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-lg font-bold mt-4 mb-2 text-black"
                {...props}
              />
            ),

            p: ({ node, ...props }) => (
              <p className="mb-4 text-gray-700 leading-7" {...props} />
            ),

            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-4 ml-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-4 ml-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-1 text-gray-700" {...props} />
            ),

            code: ({
              className,
              children,
              ...props
            }: React.ComponentPropsWithoutRef<"code">) => {
              const isInline = !String(children).includes("\n");

              if (isInline) {
                return (
                  <code
                    className="bg-gray-100 text-[#f59120] font-mono text-sm px-1.5 py-0.5 rounded border border-gray-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <code
                  className="block bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto my-3"
                  {...props}
                >
                  {children}
                </code>
              );
            },

            pre: ({ node, ...props }) => (
              <pre
                className=" p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm text-gray-800"
                {...props}
              />
            ),

            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600"
                {...props}
              />
            ),
          }}
        >
          {problem.description}
        </ReactMarkdown>
      </div>

      {}
      <div className="mt-4 border-t border-gray-200 pt-6">
        <button
          onClick={() => setIsTagsOpen(!isTagsOpen)}
          className="flex items-center justify-between w-full text-left text-black hover:bg-gray-50 p-2 rounded-md transition-colors"
          aria-expanded={isTagsOpen}
        >
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-700">Tags</h3>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform duration-300 ${
              isTagsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`
            overflow-hidden 
            transition-[max-height,opacity] 
            duration-300 
            ease-in-out
            ${isTagsOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}
          `}
        >
          <div className="pl-2 flex flex-wrap gap-2">
            {problem.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium px-3 py-1 rounded-full capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
