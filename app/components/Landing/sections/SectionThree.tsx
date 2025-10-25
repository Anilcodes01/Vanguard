import Image from "next/image";

interface TrustCardProps {
  review: string;
  avatarUrl: string;
  name: string;
  designation: string;
  index: number;
}

function TrustCard({ review, avatarUrl, name, designation, index }: TrustCardProps) {
  return (
    <div 
      className="group relative border border-gray-700 flex flex-col gap-6 p-8 rounded-2xl  hover:border-green-500 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      <div className="text-sm pt-4">
        <p className="font-sans text-gray-300 leading-relaxed italic">
          &quot;{review}&quot;
        </p>
      </div>
      <div className="flex w-full items-center gap-4 mt-2">
        <div className="relative">
          <Image
            key={name}
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-gray-700 group-hover:border-green-500 transition-colors duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-sans font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
            {name}
          </h1>
          <h2 className="text-xs font-sans text-gray-400">
            {designation}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function SectionThree() {
  const cardData = [
    {
      review:
        "The AI Readiness Report showed me I was ready for the next step. The virtual internship was intense but rewarding, giving me real experience I couldn't find elsewhere.",
      avatarUrl: "https://avatar.iran.liara.run/public/98",
      name: "Rohan Verma",
      designation: "Engineering Student, Delhi",
    },
    {
      review:
        "The daily challenges made coding a habit, not a chore. The streak system kept me motivated, and I built a portfolio I'm actually proud to show recruiters.",
      avatarUrl: "https://avatar.iran.liara.run/public/1",
      name: "Priya Sharma",
      designation: "B.Tech Student, Mumbai",
    },
    
    {
      review:
        "The verified internship record made a huge difference in my job applications. I finally had tangible proof of my skills to stand out from the crowd.",
      avatarUrl: "https://avatar.iran.liara.run/public/79",
      name: "Anjali Gupta",
      designation: "Computer Science Major, Bangalore",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-12 justify-center min-h-screen  p-8 py-20">
      <div className="flex flex-col gap-4 text-center max-w-3xl">
        <div className="inline-block mx-auto px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-2 border border-green-500/30">
          Testimonials
        </div>
        <h1 className="text-5xl font-bold font-sans text-white tracking-tight">
          Trusted By Students Across India
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Our platform empowers students to bridge the gap between academics and industry. Here's what they have to say.
        </p>
      </div>

      <div className="flex flex-wrap max-w-7xl items-stretch justify-center gap-8">
        {cardData.map((card, index) => (
          <TrustCard
            key={card.name}
            name={card.name}
            review={card.review}
            designation={card.designation}
            avatarUrl={card.avatarUrl}
            index={index}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-6 h-6 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-400 text-sm">
          Rated <span className="text-white font-semibold">4.9/5</span> by over <span className="text-white font-semibold">10,000+</span> students
        </p>
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