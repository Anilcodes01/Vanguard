import type { ReactNode } from "react";
import { RiGroupLine } from "react-icons/ri";
import { LuWrench } from "react-icons/lu";
import { IoRocketOutline } from "react-icons/io5";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
    return (
        <div 
            className="group relative flex flex-col items-start p-8 rounded-2xl border border-gray-200 hover:border-orange-500 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 w-full max-w-sm bg-white"
            style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0
            }}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-orange-500/50">
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                {description}
            </p>
            
            <div className="flex items-center text-orange-500 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                <span>Learn more</span>
                <svg 
                    className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}

export default function SectionTwo() {
    const cardData = [
        {
            icon: <RiGroupLine />,
            title: 'Daily Habit Engine',
            description: 'Solve daily DSA problems and build mini-projects. Maintain your streak, earn XP, and watch your skills grow consistently.'
        },
        {
            icon: <LuWrench />,
            title: 'Gamified Progress & Auto-Portfolio',
            description: 'Climb weekly leaderboards and earn badges for achievements. Every project you complete is automatically added to your recruiter-ready portfolio.'
        },
        {
            icon: <IoRocketOutline />,
            title: 'AI-Powered Virtual Internship',
            description: 'Convert your hard work into a verified, 2-month virtual internship. Get AI-driven feedback, a job-readiness score, and showcase your skills to recruiters.'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 sm:p-8 bg-gray-50">
            <div className="text-center mb-16 max-w-3xl">
                <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4 border border-orange-200">
                    Platform Features
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Why Choose Adapt?
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                    Everything you need to build skills, create a portfolio, and earn a verified internship.
                </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 max-w-6xl w-full">
                {cardData.map((card, index) => (
                    <FeatureCard
                        key={card.title}
                        icon={card.icon}
                        title={card.title}
                        description={card.description}
                        index={index}
                    />
                ))}
            </div>
            
            <div className="mt-16 text-center">
                <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105">
                    Start Learning Today
                </button>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}