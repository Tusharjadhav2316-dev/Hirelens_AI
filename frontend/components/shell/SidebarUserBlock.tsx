"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function SidebarUserBlock() {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

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

  const displayName = user?.displayName || "Tushar Jadhav";
  const displayEmail = user?.email || "tusharjadhav@example.com";

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
