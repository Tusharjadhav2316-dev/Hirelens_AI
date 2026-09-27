"use client";

import Link from "next/link";
import NextImage from "next/image";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  FileText, 
  Briefcase, 
  GraduationCap,
  BarChart3
} from "lucide-react";

interface HeroSectionProps {
  onWatchDemo: () => void;
}

export default function HeroSection({ onWatchDemo }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[92vh] sm:min-h-[96vh] lg:min-h-[100vh] flex flex-col justify-between overflow-hidden bg-[#0a0f26] text-white select-none pt-20">
      
      {/* 1. Full-Bleed Ultra-HD Cinematic Hero Artwork Layer (100% Edge-to-Edge) */}
      <div className="absolute inset-0 w-full h-full -z-0 pointer-events-none overflow-hidden">
        <NextImage
          src="/images/landing/hero-career-journey.webp"
          alt="Career Journey with HireLens AI"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[center_35%] lg:object-[center_38%]"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
          quality={100}
        />
        
        {/* Soft Multi-Stop Atmospheric Readability Gradient (Gentle fade on far left, 100% transparent well before the woman) */}
        <div 
          className="absolute inset-0 w-full h-full z-[1]"
          style={{
            background: "linear-gradient(to right, rgba(8,13,34,0.58) 0%, rgba(8,13,34,0.36) 24%, rgba(8,13,34,0.10) 38%, transparent 50%)"
          }}
        />
        
        {/* Subtle Top Navbar Atmospheric Blend */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#080d22]/50 via-[#080d22]/15 to-transparent z-[1]" />
      </div>

      {/* 2. Main Hero Content Grid (Left Text Safe Zone, Center-Right Woman, Right Floating Pills) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-28 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content Zone (Strict Safe Max-Width ~490px) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 text-left max-w-[490px] z-20">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/25 backdrop-blur-md border border-blue-400/40 text-blue-200 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 fill-current" />
              <span className="text-[11px] font-extrabold tracking-widest uppercase">
                AI-POWERED CAREER OPERATING SYSTEM
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              Turn Your <br />
              Potential Into <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 bg-clip-text text-transparent inline-block drop-shadow-md">
                Opportunity.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-100/95 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-[460px]">
              HireLens helps you build, optimize, and grow your career with the power of AI — from resume to interviews and beyond.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/signup"
                className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={onWatchDemo}
                className="px-6 py-3.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white border border-white/25 backdrop-blur-md font-semibold text-sm sm:text-base shadow-sm hover:border-white/40 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Avatar Cluster + Truthful Capability Line */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center -space-x-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white/80 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-[9px] font-black shadow-sm overflow-hidden shrink-0">
                  <span>PS</span>
                </div>
                <div className="flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white/80 bg-gradient-to-tr from-violet-600 to-purple-500 text-white text-[9px] font-black shadow-sm overflow-hidden shrink-0">
                  <span>AM</span>
                </div>
                <div className="flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white/80 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-[9px] font-black shadow-sm overflow-hidden shrink-0">
                  <span>NK</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                AI-powered tools for your next career move.
              </p>
            </div>

          </div>

          {/* Right Floating Elements Overlay (Deliberate Natural Stagger as shown in blueprint) */}
          <div className="lg:col-span-7 xl:col-span-7 relative h-full min-h-[400px] pointer-events-none">
            
            {/* Top Right Handwritten Script Message */}
            <div className="absolute top-0 right-4 sm:right-10 lg:right-6 z-20 select-none">
              <div className="font-script text-2xl sm:text-3xl lg:text-[34px] text-indigo-200 font-semibold drop-shadow-2xl -rotate-6 tracking-wide">
                Same You. <br />
                <span className="text-xl sm:text-2xl pl-4">Bigger Opportunities.</span>
              </div>
              {/* Subtle underline flourish */}
              <svg className="w-28 sm:w-36 h-3 text-indigo-300/90 -mt-1 ml-6" viewBox="0 0 100 10" fill="none">
                <path d="M2 7C25 2 75 2 98 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Floating Glassmorphic Pill 1: Better Resume (Top Right) */}
            <div className="absolute top-20 right-6 sm:top-24 sm:right-12 z-20 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-2xl text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">Better Resume</span>
            </div>

            {/* Floating Glassmorphic Pill 2: Dream Job (Mid Right) */}
            <div className="absolute top-36 right-2 sm:top-40 sm:right-4 z-20 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-2xl text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">Dream Job</span>
            </div>

            {/* Floating Glassmorphic Pill 3: Crack Interviews (Lower Right) */}
            <div className="absolute top-52 right-8 sm:top-56 sm:right-14 z-20 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-2xl text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">Crack Interviews</span>
            </div>

            {/* Floating Glassmorphic Pill 4: Grow Your Skills (Bottom Right) */}
            <div className="absolute top-68 right-4 sm:top-72 sm:right-6 z-20 pointer-events-auto hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-2xl text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">Grow Your Skills</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Integrated Flowing White Organic Wave at Bottom of Hero */}
      <div className="relative w-full overflow-hidden leading-none z-20 pointer-events-none -mb-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-28 text-white dark:text-slate-950 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C280,105 540,120 740,75 C940,30 1180,25 1440,65 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

    </section>
  );
}
