"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Menu, Sparkles, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import GlobalSearchInput from "./GlobalSearchInput";
import Link from "next/link";
import { toast } from "sonner";

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = user?.displayName || "Tushar Jadhav";

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-20 w-full transition-colors">
      {/* Mobile Menu Button - Left Side */}
      <div className="flex items-center lg:hidden mr-3">
        <button
          onClick={onMenuClick}
          type="button"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="sr-only">Toggle sidebar</span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-2xl mr-4 hidden md:block">
        <GlobalSearchInput />
      </div>

      {/* Right Side - Upgrade CTA, Theme, Notifications & User Chip */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Upgrade Chip CTA */}
        <button
          onClick={() => toast.info("Pro plans coming soon in Sprint 12!")}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-xs shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>Upgrade</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => toast.info("No new notifications")}
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Chip */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-2xs">
              {user?.photoURL ? (
                <img
                  className="h-full w-full rounded-full object-cover"
                  src={user.photoURL}
                  alt={displayName}
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Student • CSE
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "tusharjadhav@example.com"}
                  </p>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
