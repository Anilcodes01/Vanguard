"use client";

import EnrolledTopUi from "./EnrolledTopUI";
import InternshipProj from "./InternshipProj";

interface EnrolledUIProps {
  userName: string;
}

export default function EnrolledUI({ userName }: EnrolledUIProps) {
  return (
  <div className="flex gap-12 w-full min-h-screen flex-col items-center justify-center">
    <EnrolledTopUi userName={userName}/>
     <InternshipProj />
  
  </div>
  );
}
