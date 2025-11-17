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
  { key: "home", name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
  {
    key: "explore",
    name: "Explore",
    path: "/explore",
    icon: <Search className="h-4 w-4" />,
  },
  {
    key: "problems",
    name: "Problems",
    path: "/problems",
    icon: <Code className="h-4 w-4" />,
  },
  {
    key: "projects",
    name: "Projects",
    path: "/projects",
    icon: <Folder className="h-4 w-4" />,
  },
  {
    key: "discussions",
    name: "Discussions",
    path: "/discussions",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    key: "internlab",
    name: "Internlab",
    path: "/internship",
    icon: <Beaker className="h-4 w-4" />,
  },
  {
    key: "hellipad",
    name: "Hellipad",
    path: "/hellipad",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    key: "journal",
    name: "Journal",
    path: "/journal",
    icon: <Plus className="h-4 w-4" />,
  },
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
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className={`group flex items-center px-3 py-2 rounded-md transition-colors ${
              pathname === item.path
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            <span
              className={`mr-${
                collapsed ? 0 : 3
              } flex-shrink-0 transition-all duration-300`}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium truncate transition-all duration-300">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
