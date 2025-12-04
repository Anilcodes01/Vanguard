import {
  Tag,
  ChevronDown,
  CheckCircle2,
  Edit3,
  Lightbulb,
  Briefcase,
  ListChecks,
} from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProblemDetails } from "@/types";

interface ExtendedProblemDetails extends Omit<ProblemDetails, "tags"> {
  constraints?: string | null;
  askedByCompanies?: string[];
  hints?: { id: string; text: string; order: number }[];
  tags?: string[];
}

interface ProblemDetailsPanelProps {
  problem: ExtendedProblemDetails;
}

const difficultyStyles = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard: "bg-red-100 text-red-700 border-red-200",
};

export default function ProblemDetailsPanel({
  problem,
}: ProblemDetailsPanelProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);

  const renderStatusBadge = () => {
    if (!problem.solutionStatus) return null;

    if (problem.solutionStatus === "Solved") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-600 border border-orange-100">
          <CheckCircle2 size={12} />
          Solved
        </span>
      );
    }

    if (problem.solutionStatus === "Attempted") {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Edit3 size={12} />
          Attempted
        </span>
      );
    }

    return null;
  };

  const diffStyle =
    // @ts-expect-error - accounting for case sensitivity or type mismatch in difficulty enum
    difficultyStyles[problem.difficulty] || difficultyStyles.Easy;

  const MarkdownComponents = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-xl font-bold mt-6 mb-3 text-slate-900" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-lg font-bold mt-5 mb-2 text-slate-900" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3
        className="text-base font-semibold mt-4 mb-1 text-slate-900"
        {...props}
      />
    ),

    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-2 text-slate-600 leading-relaxed text-sm" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul
        className="list-disc list-inside mb-3 ml-2 text-slate-600 text-sm"
        {...props}
      />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol
        className="list-decimal list-inside mb-3 ml-2 text-slate-600 text-sm"
        {...props}
      />
    ),

    code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const isInline = !String(children).includes("\n");
      if (isInline) {
        return (
          <code
            className="bg-slate-100 text-slate-700 font-mono text-xs px-1 py-0.5 rounded border border-slate-200"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className="block bg-transparent font-mono text-xs overflow-x-auto"
          {...props}
        >
          {children}
        </code>
      );
    },

    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className="bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto my-2 text-slate-700"
        {...props}
      />
    ),
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {problem.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 text-xs border rounded-full font-medium ${diffStyle}`}
            >
              {problem.difficulty}
            </span>
            {renderStatusBadge()}
          </div>
        </div>

        <div className="text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {problem.description}
          </ReactMarkdown>
        </div>

        {problem.constraints && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
              <ListChecks size={16} />
              <h3 className="font-semibold text-sm">Constraints</h3>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm text-slate-600">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ...MarkdownComponents,
                  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
                    <p className="mb-1 last:mb-0" {...props} />
                  ),
                  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
                    <ul
                      className="list-disc list-inside ml-1 mb-0"
                      {...props}
                    />
                  ),
                  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
                    <li className="marker:text-slate-400" {...props} />
                  ),
                }}
              >
                {problem.constraints}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2">
          {problem.hints && problem.hints.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setIsHintsOpen(!isHintsOpen)}
                className="flex items-center justify-between w-full py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-md">
                    <Lightbulb size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    Hints
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isHintsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isHintsOpen && (
                <div className="pb-4 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex flex-col gap-3">
                    {problem.hints.map((hint, index) => (
                      <div
                        key={hint.id || index}
                        className="text-sm text-slate-600 mt-2 pl-2 border-l-2 border-yellow-100"
                      >
                        <span className="font-semibold text-slate-800 mr-2">
                          Hint {index + 1}:
                        </span>
                        {hint.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {problem.askedByCompanies && problem.askedByCompanies.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setIsCompaniesOpen(!isCompaniesOpen)}
                className="flex items-center justify-between w-full py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    Companies
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isCompaniesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCompaniesOpen && (
                <div className="pb-4 px-2 flex flex-wrap mt-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {problem.askedByCompanies.map((company, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {problem.tags && problem.tags.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setIsTagsOpen(!isTagsOpen)}
                className="flex items-center justify-between w-full py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md">
                    <Tag size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    Tags
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isTagsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isTagsOpen && (
                <div className="pb-4 px-2 flex mt-2 flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {problem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}