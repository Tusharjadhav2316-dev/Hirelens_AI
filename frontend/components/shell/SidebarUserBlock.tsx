"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";

interface SidebarUserBlockProps {
  isCollapsed?: boolean;
}

export default function SidebarUserBlock({ isCollapsed = false }: SidebarUserBlockProps) {
  const { user } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const displayName = user?.displayName || "User";
  const displayEmail = user?.email || "";

  if (isCollapsed) {
    return (
      <div className="relative border-t border-slate-200/80 dark:border-slate-800 p-2 flex flex-col items-center gap-2">
        <div
          title={`${displayName} (${displayEmail})`}
          className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900 cursor-pointer"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative border-t border-slate-200/80 dark:border-slate-800 p-3">
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {displayEmail}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

