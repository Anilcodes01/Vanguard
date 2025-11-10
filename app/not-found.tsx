"use client";

import Link from "next/link";
import React from "react";
import dynamic from 'next/dynamic';

const DynamicDotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => ({ default: mod.DotLottieReact })),
  {
    ssr: false,
    loading: () => <div className="w-72 h-72 md:w-96 md:h-96 animate-pulse bg-neutral-700 rounded-full" />,
  }
);

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626] p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-72 h-72 md:w-96 md:h-96">
          <DynamicDotLottieReact
            src="https://lottie.host/6b16a9e4-3fa2-4fb0-a346-4bd4c7bdb35e/bReA7EVgDB.lottie"
            loop
            autoplay
          />
        </div>

        <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
        <p className="max-w-sm text-neutral-400">
          Oops! The page you are looking for does not exist. It might have been
          moved or deleted.
        </p>

        <Link
          href="/"
          className="mt-4 rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-sky-600 hover:scale-105"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}