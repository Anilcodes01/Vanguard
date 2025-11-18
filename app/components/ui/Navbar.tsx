"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import NavbarActions from "./NavbarActions";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <header className="flex items-center justify-between bg-white text-black py-2 px-2 w-full border-b ">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/"
          className="text-xl items-center justify-center sm:text-2xl flex  font-bold flex-shrink-0 z-30"
        >
          <Image
            src={"/final.png"}
            alt="AntIntern logo"
            width={200}
            height={200}
            className="h-8 w-8  sm:h-10 sm:w-10"
          />
          <span className="hidden sm:inline">AntIntern</span>
        </Link>
      </div>

      <NavbarActions />
    </header>
  );
}
