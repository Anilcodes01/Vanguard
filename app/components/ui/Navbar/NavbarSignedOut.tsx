"use client";

import Link from "next/link";

export default function NavbarSignedOut() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3 lg:px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#ffffff] focus:ring-[#f59120]"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="px-3 lg:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f59120] to-orange-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-[#f59120]/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#ffffff] focus:ring-[#f59120]"
      >
        Sign Up
      </Link>
    </div>
  );
}
