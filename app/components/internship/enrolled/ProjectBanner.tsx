import { Layers, ArrowLeft, BookOpen } from "lucide-react";
import { InternshipProject } from "@/app/(public)/internship/types";

interface ProjectBannerProps {
  project: InternshipProject;
  showSpecs: boolean;
  onToggle: () => void;
}

export default function ProjectBanner({ project, showSpecs, onToggle }: ProjectBannerProps) {
  if (!project) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-orange-500 opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Layers className="w-4 h-4 text-orange-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-300">Capstone Project</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{project.title}</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button 
              onClick={onToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform active:scale-95 ${
                showSpecs 
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              {showSpecs ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Problems
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  View Project Specs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}