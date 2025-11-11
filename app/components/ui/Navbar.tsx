"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NavbarActions from "./NavbarActions"; 

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { key: "explore", name: "Explore", path: "/explore" },
    { key: "problems", name: "Problems", path: "/problems" },
    { key: "discussions", name: "Discussions", path: "/discussions" },
    { key: "leaderboard", name: "Leaderboard", path: "/leaderboard" },
    { key: "projects", name: "Projects", path: "/projects" },
  ];

  return (
    <header className="relative flex items-center justify-between bg-[#262626] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 w-full border-b border-neutral-800">
      <div className="flex items-center gap-4 xl:gap-8">
        <Link
          href="/"
          className="text-xl sm:text-2xl flex gap-2 font-bold flex-shrink-0 z-30"
        >
          <Image
            src={"/ant-intern.png"}
            alt="adapt logo"
            width={200}
            height={200}
            className="h-12 w-12 sm:h-12 sm:w-12"
          />
        </Link>
        <div className="hidden lg:flex gap-4 xl:gap-8 items-center">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.path}
              className={`cursor-pointer transition-colors text-sm xl:text-base whitespace-nowrap ${
                pathname === link.path
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <NavbarActions />
    </header>
  );
}