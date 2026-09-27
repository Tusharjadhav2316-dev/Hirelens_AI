"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Large Cinematic Rounded Container */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
          
          {/* Background Ambient Glows & City Silhouette Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 right-0 w-full max-w-lg h-48 opacity-30 pointer-events-none -z-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />

          {/* Top Right Script Accent */}
          <div className="absolute top-6 sm:top-10 right-6 sm:right-14 z-10 select-none pointer-events-none">
            <div className="font-script text-2xl sm:text-4xl text-blue-300 font-semibold drop-shadow-md -rotate-6">
              A Brighter You
            </div>
            <svg className="w-24 sm:w-36 h-3 text-blue-400/80 -mt-1 ml-4" viewBox="0 0 100 10" fill="none">
              <path d="M2 7C25 2 75 2 98 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Left Content */}
          <div className="relative z-10 max-w-xl space-y-6">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>READY FOR WHAT&apos;S NEXT?</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Build a career strategy <br />
              that moves with you.
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Join thousands of professionals who are already using HireLens to create a brighter future.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-semibold text-sm sm:text-base transition-all flex items-center justify-center transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Explore HireLens
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
