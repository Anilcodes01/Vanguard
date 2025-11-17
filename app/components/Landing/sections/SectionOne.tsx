'use client'

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SectionOne() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "500+", label: "Portfolio Projects" },
    { value: "50K+", label: "Daily Submissions" }
  ];

  const codeSnippets = [
    "const solve = () => {...}",
    "function challenge() {}",
    "if (code === perfect)",
    "while (learning) {...}",
    "return success;",
    "debug && conquer"
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden px-4 md:px-8 py-20 bg-gray-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {mounted && codeSnippets.map((snippet, i) => (
          <div
            key={i}
            className="absolute text-orange-500 font-mono text-sm animate-float"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + i * 2}s`
            }}
          >
            {snippet}
          </div>
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col w-full gap-8 items-center justify-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-xs sm:text-sm font-medium border border-orange-200 backdrop-blur-sm text-center"
          style={{
            animation: 'fadeInDown 0.6s ease-out forwards',
            opacity: 0
          }}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>Join 10,000+ students building their careers</span>
        </div>

        <h1 
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center font-sans text-gray-900 leading-tight tracking-tight"
          style={{
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0
          }}
        >
          Turn Daily Practice
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
            Into a Verified Internship
          </span>
        </h1>

        <p 
          className="max-w-2xl text-center font-sans text-gray-600 text-base md:text-lg leading-relaxed"
          style={{
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0
          }}
        >
          A gamified platform for Indian college students to solve daily challenges, build a portfolio, and land a verified virtual internship.
        </p>

        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full sm:w-auto"
          style={{
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.6s',
            opacity: 0
          }}
        >
          <button 
            onClick={() => router.push('/signup')} 
            className="group relative cursor-pointer rounded-xl px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start Solving Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button 
            onClick={() => router.push('/explore')}
            className="cursor-pointer rounded-xl px-8 py-4 bg-white text-gray-900 font-semibold border border-gray-300 hover:border-orange-500 transition-all duration-300 hover:bg-gray-50 w-full sm:w-auto"
          >
            Explore Challenges
          </button>
        </div>

        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 mt-12 pt-12 border-t border-gray-200"
          style={{
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.8s',
            opacity: 0
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div 
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-gray-600 text-sm"
          style={{
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '1s',
            opacity: 0
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free to start</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Join a cohort of learners</span>
          </div>
        </div>
      </div>

      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        style={{
          animation: 'bounce 2s infinite',
          animationDelay: '1.5s'
        }}
      >
        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.1;
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}