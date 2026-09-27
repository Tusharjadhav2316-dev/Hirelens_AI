"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface GlobalSearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function GlobalSearchInput({
  placeholder = "Search jobs, resumes, cover letters, or get AI help...",
  className = "",
}: GlobalSearchInputProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative flex items-center w-full max-w-xl ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      <input
        id="global-search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-16 bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
      />
      <div className="absolute right-2.5 flex items-center gap-0.5">
        <kbd className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-md shadow-2xs">
          ⌘ K
        </kbd>
      </div>
    </div>
  );
}
