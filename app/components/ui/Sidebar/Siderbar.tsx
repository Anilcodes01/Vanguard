"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Code,
  Folder,
  MessageCircle,
  Beaker,
  BookOpen,
  Plus,
} from "lucide-react";

const sidebarItems = [
  { key: "home", name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  { key: "explore", name: "Explore", path: "/explore", icon: <Search className="h-5 w-5" /> },
  { key: "problems", name: "Problems", path: "/problems", icon: <Code className="h-5 w-5" /> },
  { key: "projects", name: "Projects", path: "/projects", icon: <Folder className="h-5 w-5" /> },
  { key: "discussions", name: "Discussions", path: "/discussions", icon: <MessageCircle className="h-5 w-5" /> },
  { key: "internlab", name: "Internlab", path: "/internship", icon: <Beaker className="h-5 w-5" /> },
  { key: "hellipad", name: "Hellipad", path: "/hellipad", icon: <BookOpen className="h-5 w-5" /> },
  { key: "journal", name: "Journal", path: "/journal", icon: <Plus className="h-5 w-5" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function Sidebar({ collapsed, onMouseEnter, onMouseLeave }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <nav className="flex-1 px-2 py-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.key}
              href={item.path}
              className={`
                group relative flex items-center gap-4
                h-10 px-3 rounded-lg transition-all duration-200
                ${isActive
                  ? "bg-[#f59120] text-white font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <div className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                {item.icon}
              </div>

              <span
                className={`
                  text-sm font-medium origin-left transition-all duration-300
                  ${collapsed 
                    ? "scale-0 opacity-0 w-0" 
                    : "scale-100 opacity-100"
                  }
                `}
              >
                {item.name}
              </span>

             
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}