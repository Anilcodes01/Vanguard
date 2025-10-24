'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function DiscussionsPage() {
  return (
    <div className="flex min-h-screen bg-[#262626] justify-center p-4">
      <div className="flex flex-col items-center mt-20 text-center">
        <div className="w-64 h-64 md:w-80 md:h-80">
          <DotLottieReact
            src="https://lottie.host/b6fb2020-fd2d-48a2-94ec-9a1b40e1299e/Iwz8u21sgi.lottie"
            loop
            autoplay
          />
        </div>
        
        <h1 className="text-4xl md:text-3xl font-bold text-white  tracking-wider">
          Coming Soon
        </h1>
        <p className="text-neutral-400 mt-2 text-sm">
          The discussions feature is under construction. Stay tuned!
        </p>
      </div>
    </div>
  );
}