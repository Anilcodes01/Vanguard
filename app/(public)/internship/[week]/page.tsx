"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  BookOpen, 
  Layers, 
  AlertCircle,
  ListChecks,
  Trophy,
  FileText,
  Terminal
} from "lucide-react";

interface InternshipProblem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

interface InternshipProject {
  id: string;
  title: string;
  description: string;
  githubLink?: string;
  liveLink?: string;
  isCompleted: boolean;
}

interface WalkthroughCard {
  id: string;
  cardType: string;
  title: string;
  content: string;
}

interface InternshipWeekData {
  id: string;
  weekNumber: number;
  title: string;
  topics: string[]; // --- FIX 1: Match Prisma Schema (Array, not string) ---
  description: string;
  projects: InternshipProject[];
  problems: InternshipProblem[];
  walkthroughs: WalkthroughCard[];
}

const CARD_ORDER = [
  'case_study',
  'problem_definition',
  'objective',
  'prerequisites',
  'deliverables',
  'rules',
  'action_plan'
];

export default function IndividualInternshipWeek() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const weekNumber = params.week as string;
  const weekNumberInt = parseInt(weekNumber);
  
  const topicParam = searchParams.get("topic");
  const projectTitleParam = searchParams.get("projectTitle");
  
  const [data, setData] = useState<InternshipWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        
        const res = await fetch("/api/internship/generateWeekData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week: weekNumberInt,
            topic: topicParam || "Web Development",
            projectTitle: projectTitleParam || "Weekly Project",
            projectDescription: "Focus on the core concepts and build the project.",
          }),
        });

        const jsonData = await res.json();
        console.log('Data from api: ', jsonData)

        if (!res.ok) {
          throw new Error(jsonData.error || "Failed to load curriculum");
        }

        const weekData = jsonData.data || jsonData;
        setData(weekData);

      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (weekNumberInt) {
      fetchData();
    }
  }, [weekNumberInt, topicParam, projectTitleParam]);

  const sortedWalkthroughs = useMemo(() => {
    if (!data?.walkthroughs) return [];
    
    return [...data.walkthroughs].sort((a, b) => {
      const indexA = CARD_ORDER.indexOf(a.cardType);
      const indexB = CARD_ORDER.indexOf(b.cardType);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return 0;
    });
  }, [data]);

  const formatMarkdownText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const RenderCardContent = ({ content }: { content: string, type: string }) => {
    const parsedData = useMemo(() => {
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    }, [content]);

    if (Array.isArray(parsedData)) {
      return (
        <ul className="space-y-3">
          {parsedData.map((item: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{formatMarkdownText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof parsedData === "object" && parsedData !== null) {
      return (
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(parsedData).map(([key, val]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <span className="font-semibold text-gray-800 capitalize mb-1 sm:mb-0">
                {key.replace(/_/g, " ")}
              </span>
              <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 break-all">
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
        {String(parsedData).split('\n').map((line, i) => (
          <p key={i} className="mb-2 last:mb-0">{formatMarkdownText(line)}</p>
        ))}
      </div>
    );
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'case_study': return { icon: <FileText className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-100' };
      case 'problem_definition': return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-100' };
      case 'objective': return { icon: <Trophy className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' };
      case 'action_plan': return { icon: <ListChecks className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-100' };
      case 'rules': return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 'prerequisites': return { icon: <Layers className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      default: return { icon: <BookOpen className="w-4 h-4" />, color: 'text-gray-600 bg-gray-50 border-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
        <h2 className="text-lg font-medium text-gray-800">Generating Curriculum...</h2>
        <p className="text-gray-500 text-sm mt-1">Our AI Mentor is structuring your week</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Week</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "Week data could not be found."}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const mainProject = data.projects[0];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/internship" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Week {data.weekNumber} 
                <span className="text-gray-300">|</span> 
                {/* --- FIX 2: Use data.topics[0] because topic is an array in DB --- */}
                <span className="text-orange-600">{data.title}</span>
              </h1>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              0/{data.problems.length + 1} Completed
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Module</h2>
              <p className="text-gray-500 text-sm">Follow these cards step-by-step to complete the week objective.</p>
            </div>

            <div className="space-y-6">
              {sortedWalkthroughs.map((card, index) => {
                const style = getCardStyle(card.cardType);
                return (
                  <div 
                    key={card.id} 
                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className={`px-6 py-4 flex justify-between items-center border-b border-gray-100 ${style.color.split(' ')[1]} bg-opacity-30`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.color}`}>
                          {style.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        Step {index + 1}
                      </span>
                    </div>

                    <div className="p-6">
                      <RenderCardContent content={card.content} type={card.cardType} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            
            {mainProject && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Core Project</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{mainProject.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                  {mainProject.description}
                </p>
                
                <button className="w-full py-2.5 bg-white text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-100 transition shadow-sm">
                  View Project Specs
                </button>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-24">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-500" />
                  Coding Drills
                </h3>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                  {data.problems.length} Tasks
                </span>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                {data.problems.map((problem, idx) => (
                  <div 
                    key={problem.id} 
                    className="p-4 hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-xs font-mono text-gray-400 mt-1">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                          {problem.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center">
                <p className="text-xs text-gray-400">Solve all problems to unlock next week</p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}