import { ChevronRight, Code2 } from "lucide-react";
import { InternshipProblem } from "@/app/(public)/internship/types";
import Link from "next/link";

export default function ProblemGrid({ problems }: { problems: InternshipProblem[] }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Coding Drills</h2>
           <p className="text-gray-500 text-sm mt-1">Solve these problems to master the concepts.</p>
        </div>
        <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
          {problems.length} Challenges
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
          <Link
            href={`/internship/problem/${problem.id}`} 
            key={problem.id}
            className="block" 
          >
            <div 
              className="h-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 group flex flex-col cursor-pointer"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs font-mono font-bold group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="p-2 rounded-full bg-gray-50 group-hover:bg-white transition-colors">
                    <Code2 className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                  </div>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {problem.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {problem.description}
                </p>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-between items-center group-hover:bg-orange-50/30 transition-colors">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                   {problem.isCompleted ? "Solved" : "Unsolved"}
                </span>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Solve <ChevronRight className="w-4 h-4 text-orange-500" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}