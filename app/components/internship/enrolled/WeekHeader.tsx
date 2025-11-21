import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface WeekHeaderProps {
  weekNumber: number;
  title: string;
  totalProblems: number;
}

export default function WeekHeader({ weekNumber, title, totalProblems }: WeekHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internship" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Week {weekNumber} 
              <span className="text-gray-300">|</span> 
              <span className="text-orange-600">{title}</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            0/{totalProblems + 1} Completed
          </div>
        </div>
      </div>
    </header>
  );
}