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
            className="group relative flex flex-col items-start p-8 rounded-2xl  border border-gray-700 hover:border-green-500 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 max-w-sm"
            style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0
            }}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-green-500/50">
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                {description}
            </p>
            
            <div className="flex items-center text-green-500 font-medium text-sm group-hover:gap-2 transition-all duration-300">
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
            title: 'Real-Time Collaboration',
            description: 'Code together, share projects, and review code seamlessly with our integrated collaboration tools.'
        },
        {
            icon: <LuWrench />,
            title: 'Powerful Built-in Tools',
            description: 'Utilize our integrated debugger, linter, and version control systems right out of the box.'
        },
        {
            icon: <IoRocketOutline />,
            title: 'One-Click Deployment',
            description: 'Deploy your applications directly from the development environment with a single click.'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen  p-8 py-20">
            <div className="text-center mb-16 max-w-3xl">
                <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-4 border border-green-500/30">
                    Platform Features
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                    Why Choose Our Platform?
                </h1>
                <p className="text-gray-400 text-lg">
                    Everything you need to learn, build, and deploy your projects in one place
                </p>
            </div>
            
            <div className="flex flex- items-stretch justify-center gap-8 max-w-6xl">
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
                <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105">
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