"use client";

import Link from "next/link";
import { 
  FileText, 
  Target, 
  Briefcase, 
  PenTool, 
  Mic, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Search
} from "lucide-react";

export default function FeatureGrid() {
  return (
    <section id="features" className="pt-8 sm:pt-12 pb-0 bg-white dark:bg-slate-950 transition-colors scroll-mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="text-xs font-extrabold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
            EVERYTHING YOU NEED
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            A Complete Career Operating System
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From your first resume to your dream job — HireLens is your AI career companion at every step.
          </p>
        </div>

        {/* 3x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Resume Builder (Blue) */}
          <Link
            href="/resume-builder"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Resume Builder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Create, edit, and optimize your resume with AI.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: Mini Resume Document */}
              <div className="w-28 sm:w-32 flex-shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-inner space-y-1.5 pointer-events-none">
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center">
                    JS
                  </div>
                  <div className="space-y-0.5">
                    <div className="w-10 h-1.5 bg-slate-400 dark:bg-slate-500 rounded" />
                    <div className="w-6 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="w-4/5 h-1 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-full h-1 bg-blue-200 dark:bg-blue-900/60 rounded" />
                <div className="flex gap-1 pt-0.5">
                  <div className="w-4 h-1.5 bg-blue-400/80 rounded" />
                  <div className="w-5 h-1.5 bg-indigo-400/80 rounded" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: ATS Analyzer (Violet) */}
          <Link
            href="/ats-score"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  ATS Analyzer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Check your resume's ATS score and get insights.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Analyze Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: ATS Circular Score Gauge (98) */}
              <div className="w-24 sm:w-28 flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 pointer-events-none">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-teal-500 dark:text-teal-400"
                      strokeDasharray="98, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800 dark:text-white">
                    98
                  </span>
                </div>
                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 mt-1">
                  High Match
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Job Search (Emerald) */}
          <Link
            href="/job-search"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Job Search
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Find the right opportunities that match your skills.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: Job Search Card */}
              <div className="w-28 sm:w-32 flex-shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 pointer-events-none">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] text-slate-400">
                  <Search className="w-2.5 h-2.5 text-emerald-500" />
                  <span>React Dev</span>
                </div>
                <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="w-12 h-1.5 bg-slate-700 dark:bg-slate-300 rounded" />
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-slate-400">$120k</span>
                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 4: Cover Letters (Rose) */}
          <Link
            href="/cover-letter"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Cover Letters
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Generate tailored cover letters in seconds.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Create Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: Tailored Letter Stationery */}
              <div className="w-24 sm:w-28 flex-shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5 pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-1">
                  <Sparkles className="w-3 h-3 fill-current" />
                </div>
                <div className="w-full h-1 bg-slate-400 dark:bg-slate-500 rounded" />
                <div className="w-5/6 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="w-4/5 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="w-3/5 h-1 bg-rose-400/80 rounded" />
              </div>
            </div>
          </Link>

          {/* Card 5: Interview Trainer (Indigo) */}
          <Link
            href="/interview-trainer"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Interview Trainer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Practice with AI and build confidence.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Start Practicing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: AI Interview Video Call Simulation */}
              <div className="w-28 sm:w-32 flex-shrink-0 p-2 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-md flex flex-col items-center space-y-1 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                  AI
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-[8px] font-bold text-indigo-300">Live AI Coach</span>
              </div>
            </div>
          </Link>

          {/* Card 6: Career Roadmap (Amber) */}
          <Link
            href="/career-roadmap"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Career Roadmap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get personalized guidance for long-term growth.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Explore Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Visual Preview: 3D Growth Ascending Bar Chart */}
              <div className="w-24 sm:w-28 flex-shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-end justify-between h-16 pointer-events-none">
                <div className="w-3 h-5 bg-amber-300/80 dark:bg-amber-600/60 rounded-t-sm" />
                <div className="w-3 h-8 bg-amber-400 dark:bg-amber-500 rounded-t-sm" />
                <div className="w-3 h-11 bg-amber-500 dark:bg-amber-400 rounded-t-sm" />
                <div className="w-3 h-14 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm shadow-xs" />
              </div>
            </div>
          </Link>

        </div>

      </div>

      {/* Integrated Deep Navy Wave leading into How It Works */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none -mb-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-28 text-[#080F2B] block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,35 C320,105 720,0 1080,75 C1240,105 1360,65 1440,45 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

    </section>
  );
}
