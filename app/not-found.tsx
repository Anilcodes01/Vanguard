"use client";

import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626] p-4 text-center">
      <div className="flex flex-col items-center gap-4">
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