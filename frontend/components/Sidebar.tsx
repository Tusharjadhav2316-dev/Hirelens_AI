"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Video,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FileEdit,
  Mail,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UpgradeCard from "./shell/UpgradeCard";
import SidebarUserBlock from "./shell/SidebarUserBlock";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (isCollapsed: boolean | ((prev: boolean) => boolean)) => void;
}

// Exactly 9 navigation items in exact product order matching Sprint 11 Day 05 requirements
const navigationItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Agent", href: "/dashboard/agent", icon: Sparkles },
  { name: "Interview Trainer", href: "/dashboard/interview-trainer", icon: Video },
  { name: "Career Coach", href: "/dashboard/career-coach", icon: GraduationCap },
  { name: "Job Search", href: "/dashboard/job-matcher", icon: Briefcase },
  { name: "ATS Analyzer", href: "/dashboard/resume-analyzer", icon: ShieldCheck },
  { name: "Resume Builder", href: "/dashboard/builder", icon: FileEdit },
  { name: "Cover Letters", href: "/dashboard/cover-letter", icon: Mail },
  { name: "Profile Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({
  isOpen = false,
  setIsOpen,
  isCollapsed = false,
  setIsCollapsed,
}: SidebarProps) {
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
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-200 ease-in-out",
          // Mobile state
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed vs expanded width
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64"
        )}
      >
        {/* Logo Lockup & Desktop Collapse Button */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 transition-opacity hover:opacity-90 overflow-hidden",
              isCollapsed && "lg:justify-center lg:w-full"
            )}
            title="HireLens AI"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shadow-indigo-500/30 flex-shrink-0">
              <span className="font-extrabold text-sm tracking-tight">HL</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Hire<span className="text-indigo-600 dark:text-indigo-400">Lens</span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {setIsCollapsed && !isCollapsed && (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen?.(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsed Expand Toggle for Desktop */}
        {setIsCollapsed && isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

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
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150",
                  isCollapsed ? "lg:justify-center lg:px-2" : "",
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
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Upgrade Card (Hidden when collapsed on desktop) */}
        {!isCollapsed && <UpgradeCard />}

        {/* User Footer Profile */}
        <SidebarUserBlock isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}

