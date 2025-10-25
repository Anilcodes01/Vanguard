import { useState } from 'react';

const faqData = [
  {
    question: "Is Adapt really free to use?",
    answer: "Yes! Our core Habit Engine is completely free. You can solve daily problems, build mini-projects, maintain streaks, and create your portfolio without any cost. The 2-month virtual internship is a paid, cohort-based program you can enroll in when you're ready."
  },
  {
    question: "What do I get from the paid virtual internship?",
    answer: "The paid internship provides a structured, 2-month experience with real-world projects, AI-driven evaluation, a skill graph, a job-readiness score, a verified LinkedIn-embeddable record, mentor AMAs, and access to our recruiter showcase for top performers."
  },
  {
    question: "Will recruiters recognize this internship?",
    answer: "We focus on verifiable experience, not just a certificate. We are building pilot partnerships with startups and colleges to ensure our verified internship records are recognized. Top performers also get a human-signed reference letter and are featured in our recruiter showcase."
  },
  {
    question: "How does the 'Internship Ready' trigger work?",
    answer: "After you reach milestones like a 30-day streak or completing 50 projects, our system generates a preview of your 'AI Readiness Report'. This highlights your strengths and shows how the paid internship can help you level up, encouraging you to convert when you're prepared."
  },
  {
    question: "What domains or tracks can I choose from?",
    answer: "In Phase 1, we focus on high-demand tracks like Web Development, Data Science, and Algorithms. You can set your preference upon signing up, and we will be expanding our offerings based on student feedback and industry demand."
  }
];

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void; }) => {
  return (
    <div className="group  rounded-xl b hover:border-green-500/50 transition-all duration-300 overflow-hidden">
      <button
        className="flex cursor-pointer justify-between items-center w-full text-lg text-left text-white p-6  transition-colors duration-200"
        onClick={onClick}
      >
        <span className="font-semibold pr-8 group-hover:text-green-400 transition-colors duration-300">
          {question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-green-500/20 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      
      <div 
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div 
          className="px-6 pb-6 pt-2 text-gray-400 leading-relaxed"
          style={{
            animation: isOpen ? 'slideDown 0.5s ease-out' : 'none'
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function SectionFive() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative  text-white py-20 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-4 border border-green-500/30">
            FAQ
          </div>
          <h2 className="text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about the Adapt platform.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqData.map((faq, index) => (
            <div
              key={index}
              style={{
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              <FaqItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => handleItemClick(index)}
              />
            </div>
          ))}
        </div>

      <div className='w-full items-center font-sans justify-center flex gap-1'>
        <span>Can&apos;t find an answer? </span>
        <span className='text-green-500 underline cursor-pointer'>Contact Support</span>
      </div>
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

        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}