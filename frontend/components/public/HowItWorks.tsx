"use client";

import Link from "next/link";
import { 
  Upload, 
  Sparkles, 
  Rocket, 
  ArrowRight,
  FileCheck,
  BarChart,
  Target
} from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-16 sm:pt-24 pb-0 bg-[#080F2B] text-white relative overflow-hidden select-none scroll-mt-16">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 relative z-10">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold tracking-widest uppercase">
            <span>⚡</span>
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Your Career Journey in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Go from where you are to where you want to be with the power of AI.
          </p>
        </div>

        {/* Connected Horizontal Step Tracker */}
        <div className="relative max-w-4xl mx-auto mb-16 sm:mb-20">
          {/* Glowing Connecting Line */}
          <div className="hidden sm:block absolute top-1/2 left-16 right-16 -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 opacity-60 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 Node */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-black text-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] border-2 border-white/20">
                1
              </div>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 text-white font-black text-lg flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] border-2 border-white/20">
                2
              </div>
            </div>

            {/* Step 3 Node */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)] border-2 border-white/20">
                3
              </div>
            </div>
          </div>
        </div>

        {/* 3 Dark Glass Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Process Card 1: Upload or Build */}
          <div className="group relative p-7 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Upload or Build
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Create your resume or upload your existing one.
              </p>
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all pt-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3D Glass Document Graphic Preview */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center">
              <div className="w-36 p-3 rounded-xl bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-500/30 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="w-12 h-1.5 bg-blue-400 rounded" />
                  <div className="w-8 h-1 bg-slate-400 rounded" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center shadow-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Process Card 2: Analyze & Improve */}
          <div className="group relative p-7 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-violet-500/40 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-400/30 text-violet-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                Analyze & Improve
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Get AI-powered insights and personalized suggestions.
              </p>
              <Link
                href="/ats-score"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 group-hover:text-violet-300 group-hover:translate-x-1 transition-all pt-2"
              >
                <span>Analyze Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3D Glass Dashboard Graphic Preview */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center">
              <div className="w-36 p-3 rounded-xl bg-gradient-to-br from-violet-950/80 to-purple-950/80 border border-violet-500/30 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-violet-300">Score +24%</span>
                  <div className="w-14 h-1.5 bg-violet-400 rounded" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-violet-500/30 text-violet-300 flex items-center justify-center shadow-xs">
                  <BarChart className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Process Card 3: Apply & Grow */}
          <div className="group relative p-7 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Apply & Grow
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Find opportunities, prepare for interviews, and achieve your goals.
              </p>
              <Link
                href="/job-search"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all pt-2"
              >
                <span>Explore Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3D Glowing Target Board Graphic Preview */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center">
              <div className="w-36 p-3 rounded-xl bg-gradient-to-br from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-300">Target Match</span>
                  <div className="w-14 h-1.5 bg-emerald-400 rounded" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Integrated White Organic Wave at Bottom leading into Social Proof */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none -mb-1 relative z-20">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-28 text-white dark:text-slate-950 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C320,10 680,105 1040,40 C1240,10 1360,50 1440,75 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

    </section>
  );
}
