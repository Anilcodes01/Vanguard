'use client'

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SectionFour() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-20 px-4 sm:px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {mounted && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-green-400/30 animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
        
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-900/50 to-gray-900"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center rotate-12 shadow-2xl shadow-green-500/50">
              <svg className="w-10 h-10 text-white -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-green-500/50 animate-ping"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-green-500/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold mb-6 tracking-tight">
          <span className="text-white">Ready to Launch </span>
          <span className="block mt-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-transparent bg-clip-text animate-gradient">
            Your Tech Career?
          </span>
        </h1>
        
        <p className="text-lg md:text-xl font-sans text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students turning daily practice into career success.
          <span className="block mt-2 text-green-400 font-semibold">Your journey to a verified internship starts here.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button 
            onClick={() => router.push('/signup')} 
            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer hover:from-green-600 hover:to-emerald-700 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105 overflow-hidden w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start for Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <button 
            onClick={() => router.push('/demo')}
            className="group bg-gray-800 cursor-pointer hover:bg-gray-700 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all duration-300 border border-gray-700 hover:border-green-500 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              Watch Demo
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-center gap-6 md:gap-8 text-gray-400 text-sm pt-8 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Free-tier with daily challenges</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span>No credit card needed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span>Join 10,000+ students</span>
          </div>
        </div>

        <div className="mt-16 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.6;
          }
        }

        .animate-float-particle {
          animation: float-particle ease-in-out infinite;
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}