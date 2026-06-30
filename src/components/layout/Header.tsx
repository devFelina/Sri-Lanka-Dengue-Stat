import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

interface HeaderProps {
  currentPage: "home" | "compare" | "about";
}

const navItems = [
  { to: "/", label: "Home", page: "home" as const },
  { to: "/compare", label: "Compare", page: "compare" as const },
  { to: "/about", label: "About", page: "about" as const },
];

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/90">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-100">
                Dengue Dashboard
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Sri Lanka surveillance
              </p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  currentPage === item.page
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
