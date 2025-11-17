"use client";

import SectionOne from "./sections/SectionOne";
import SectionTwo from "./sections/SectionTwo";
import SectionThree from "./sections/SectionThree";
import SectionFour from "./sections/SectionFour";
import SectionFive from "./sections/SectionFive";
import Footer from "./sections/Footer";

export default function UsernotLoggedInLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff] text-black gap-">
      <div className="w-full">
        <SectionOne />
      </div>
      <div className="w-full">
        <SectionTwo />
      </div>
      <div className="w-full">
        <SectionThree />
      </div>
      <div className="w-full">
        <SectionFour />
      </div>
      <div className="w-full">
        <SectionFive />
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
