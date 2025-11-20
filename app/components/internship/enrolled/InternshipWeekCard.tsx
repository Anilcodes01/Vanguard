import React from 'react';

interface InternshipWeekProps {
  week: string;
  topic: string; 
  projectTitle: string;
  problemTitle: string; 
}

export default function InternshipWeekCard({
  week,
  topic,
  projectTitle,
  problemTitle,
}: InternshipWeekProps) {
  return (
    <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden hover:shadow-2xl cursor-pointer hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#f59120] mb-2">{week}</h3>
        <p className="text-sm text-gray-700 mb-4">
          <span className="font-semibold">Topic:</span> {topic}
        </p>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-lg font-semibold mb-1">Projects: 1</p>
          <p className="text-sm text-gray-600 mb-4 italic">&quot;{projectTitle}&quot;</p>
          
        </div>
      </div>
    </div>
  );
}