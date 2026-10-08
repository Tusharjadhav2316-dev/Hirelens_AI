import Image from "next/image";
import { 
  Sparkles, 
  Target, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Zap,
  ArrowRight
} from "lucide-react";
import ScoreRing from "@/components/common/ScoreRing";
import MetricBar from "@/components/common/MetricBar";
import ScriptAccent from "@/components/common/ScriptAccent";
import { cn } from "@/lib/utils";

interface AuthCollageSignUpProps {
  className?: string;
}

export default function AuthCollageSignUp({ className = "" }: AuthCollageSignUpProps) {
  return (
    <div className={cn("relative w-full space-y-3", className)}>
      {/* 1. Top Script Accent (Strictly inside Column B) */}
      <div className="flex justify-end pr-1">
        <ScriptAccent
          text="Your Career Starts Here ➔"
          rotation="-rotate-2"
          className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide"
        />
      </div>

      {/* 2. Central Translucent Frosted Glass Career Platform HUD */}
      <div className="relative rounded-2xl border border-white/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] space-y-3 transition-all duration-300 overflow-hidden">
        {/* Subtle background art glow inside card boundary */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 z-0">
          <Image
            src="/images/auth/signup-visual-foundation.jpg"
            alt="Career Onboarding UI Visual"
            fill
            className="object-cover object-center filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-slate-900/90 dark:via-slate-900/50" />
        </div>

        {/* Card Header: Platform HUD + AI Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              AI Career Operating System
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold shadow-2xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Powered</span>
          </div>
        </div>

        {/* Score & Profile Progress Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-0.5">
          {/* Donut Score Meter */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
            <ScoreRing score={91} size="md" />
            <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5 leading-tight">
              ATS Optimization Ready
            </p>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
              ▲ +12% Pass Rate
            </span>
          </div>

          {/* Breakdown Bars */}
          <div className="sm:col-span-7 space-y-1.5 pl-1 sm:border-l sm:border-slate-200/60 dark:sm:border-slate-700/60">
            <MetricBar label="Resume Formatting" value={95} color="indigo" showPercent />
            <MetricBar label="Skill Match Target" value={92} color="emerald" showPercent />
            <MetricBar label="Impact Quantification" value={88} color="blue" showPercent />
            <MetricBar label="Interview Readiness" value={85} color="violet" showPercent />
          </div>
        </div>
      </div>

      {/* 3. Lightweight Floating Metric Chips (Strictly inside Column B) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric Chip 1: Job Match */}
        <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">87%</span>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">• Match</span>
            </div>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 truncate">
              Targeted Opportunities
            </p>
          </div>
        </div>

        {/* Metric Chip 2: AI Optimization */}
        <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-900 dark:text-white block truncate">
              Multi-Agent Co-Pilot
            </span>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 truncate">
              Continuous Coaching
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Quality Badge & Script Accent */}
      <div className="flex items-center justify-between pt-0.5 px-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800/60 text-[9px] font-semibold text-slate-600 dark:text-slate-400">
          <Award className="w-3 h-3 text-indigo-500" />
          <span>Interactive Career Operating System</span>
        </div>

        <ScriptAccent
          text="A Brighter You"
          rotation="-rotate-3"
          className="text-slate-400 dark:text-slate-500 text-xs font-medium"
        />
      </div>
    </div>
  );
}
