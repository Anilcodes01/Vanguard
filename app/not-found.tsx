"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function NotFound() {
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/notfound.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff] p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ height: 250, width: "100%" }}
          />
        )}
        <h1 className="text-3xl font-bold text-black">Page Not Found</h1>
        <p className="max-w-sm text-neutral-400">
          Oops! The page you are looking for does not exist. It might have been
          moved or deleted.
        </p>

        <Link
          href="/"
          className="mt-4 rounded-lg bg-[#f59120] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300  hover:scale-105"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}