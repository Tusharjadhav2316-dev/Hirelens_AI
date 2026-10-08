"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ChevronDown, 
  FileText, 
  Target, 
  Briefcase, 
  PenTool, 
  Mic, 
  CreditCard,
  Crown
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  rightAction?: "backToHome" | "signInPrompt" | "signUpPrompt";
  className?: string;
}

export default function AuthHeader({
  rightAction = "backToHome",
  className = "",
}: AuthHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header
      className={cn(
        "h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md flex items-center justify-between z-30 sticky top-0",
        className
      )}
    >
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-8">
        {/* HireLens Logo Mark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            HL
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            HireLens
          </span>
        </Link>

        {/* Dropdown Links (Visible on Tablet & Desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {/* Product */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("product")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <span>Product</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === "product" && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2">
                  <Link
                    href="/dashboard/builder"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Resume Builder</h4>
                      <p className="text-[10px] text-slate-500">AI-optimized templates</p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/resume-analyzer"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Target className="w-4 h-4 text-violet-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">ATS Analyzer</h4>
                      <p className="text-[10px] text-slate-500">Score & keyword insights</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Solutions */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown("solutions")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === "solutions" && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2">
                  <Link
                    href="/dashboard/job-matcher"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Job Matcher</h4>
                      <p className="text-[10px] text-slate-500">Targeted skill alignment</p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/interview-trainer"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Interview Trainer</h4>
                      <p className="text-[10px] text-slate-500">Voice & mock coach</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Resources */}
          <Link
            href="/#how-it-works"
            className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            Resources
          </Link>

          {/* Pricing */}
          <Link
            href="/#pricing"
            className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            Pricing
          </Link>
        </nav>
      </div>

      {/* Right: ThemeToggle + Action Link */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {rightAction === "backToHome" && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        )}

        {rightAction === "signInPrompt" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {rightAction === "signUpPrompt" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Don&apos;t have an account?
            </span>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
