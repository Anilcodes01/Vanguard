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

interface SidebarItem {
  key: string;
  name: string;
  path: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
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

export default function Sidebar({
  collapsed,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <nav className="flex-1 p-2 space-y-2 scrollbar-stable">
        {sidebarItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className={`group flex items-center gap-3 py-2 rounded-lg transition-all duration-200 ${
              pathname === item.path
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } ${
              collapsed ? "px-[14px]" : "px-4"
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>

            <span
              className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                collapsed
                  ? "w-0 opacity-0"
                  : "w-auto opacity-100"
              }`}
            >
              {item.name}
            </span>

            {collapsed && (
              <span className="absolute left-16 ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}