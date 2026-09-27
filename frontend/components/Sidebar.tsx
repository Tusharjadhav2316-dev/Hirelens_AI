"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  FileEdit,
  ShieldCheck,
  Briefcase,
  Mail,
  Video,
  GraduationCap,
  History,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UpgradeCard from "./shell/UpgradeCard";
import SidebarUserBlock from "./shell/SidebarUserBlock";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

// Exactly 10 navigation items matching the 13-page reference PDF
const navigationItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Agent", href: "/dashboard/agent", icon: Sparkles },
  { name: "Resume Builder", href: "/dashboard/builder", icon: FileEdit },
  { name: "ATS Analyzer", href: "/dashboard/resume-analyzer", icon: ShieldCheck },
  { name: "Job Search", href: "/dashboard/job-matcher", icon: Briefcase },
  { name: "Cover Letters", href: "/dashboard/cover-letter", icon: Mail },
  { name: "Interview Trainer", href: "/dashboard/interview-trainer", icon: Video },
  { name: "Career Coach", href: "/dashboard/career-coach", icon: GraduationCap },
  { name: "Resume History", href: "/dashboard/history", icon: History },
  { name: "Profile Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen?.(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Lockup */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shadow-indigo-500/30">
              <span className="font-extrabold text-sm tracking-tight">HL</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Hire<span className="text-indigo-600 dark:text-indigo-400">Lens</span>
            </span>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen?.(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Upgrade Card */}
        <UpgradeCard />

        {/* User Footer Profile */}
        <SidebarUserBlock />
      </aside>
    </>
  );
}
