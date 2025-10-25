import { useState } from 'react';

const faqData = [
  {
    question: "What programming languages does the platform support?",
    answer: "Our platform supports a wide range of popular programming languages including JavaScript, Python, Java, C++, Ruby, Go, and more. We are constantly expanding our language support based on developer demand."
  },
  {
    question: "How does the pricing work?",
    answer: "We offer a flexible pricing model to suit your needs. This includes a free tier for individual developers, a professional plan with advanced features for small teams, and an enterprise plan with dedicated support and custom integrations for larger organizations. You can find detailed information on our pricing page."
  },
  {
    question: "Is my code secure on your platform?",
    answer: "Absolutely. We prioritize the security of your code with measures such as end-to-end encryption, regular security audits, and compliance with industry standards. You retain full ownership of your intellectual property."
  },
  {
    question: "Can I collaborate with my team?",
    answer: "Yes, our platform is built for collaboration. You can invite team members, manage permissions, and work together on projects in real-time. Our tools are designed to streamline your team's workflow and enhance productivity."
  },
  {
    question: "What kind of technical support do you offer?",
    answer: "We provide comprehensive technical support to all our users. This includes detailed documentation, community forums, and email support for all plans. For our enterprise customers, we offer dedicated account managers and 24/7 priority support to ensure any issues are resolved quickly."
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
            Everything you need to know about our platform
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