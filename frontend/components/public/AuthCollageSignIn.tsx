import Image from "next/image";
import { 
  Sparkles, 
  Target, 
  Award,
  CheckCircle2
} from "lucide-react";
import ScoreRing from "@/components/common/ScoreRing";
import MetricBar from "@/components/common/MetricBar";
import ScriptAccent from "@/components/common/ScriptAccent";
import { cn } from "@/lib/utils";

interface AuthCollageSignInProps {
  className?: string;
}

export default function AuthCollageSignIn({ className = "" }: AuthCollageSignInProps) {
  return (
    <div className={cn("relative w-full space-y-3", className)}>
      {/* 1. Top Script Accent (Strictly contained in Column B) */}
      <div className="flex justify-end pr-1">
        <ScriptAccent
          text="Turn Insights Into Opportunities ➔"
          rotation="-rotate-2"
          className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide"
        />
      </div>

      {/* 2. Central Translucent Frosted Glass Resume Score HUD Card */}
      <div className="relative rounded-2xl border border-white/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] space-y-3 transition-all duration-300 overflow-hidden">
        {/* Subtle background art glow inside card boundary */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 z-0">
          <Image
            src="/images/auth/signin-visual-foundation.jpg"
            alt="Career Platform UI Visual"
            fill
            className="object-cover object-center filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-slate-900/90 dark:via-slate-900/50" />
        </div>

        {/* Card Header: Score Title + Dynamic Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              ATS Compatibility Score
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold shadow-2xs">
            <span>▲ +12%</span>
          </div>
        </div>

        {/* Donut Score & Metric Breakdown Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-0.5">
          {/* Donut Score Meter */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
            <ScoreRing score={91} size="md" />
            <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5 leading-tight">
              Top 5% Profile
            </p>
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              ATS Optimized
            </span>
          </div>

          {/* Breakdown Bars */}
          <div className="sm:col-span-7 space-y-1.5 pl-1 sm:border-l sm:border-slate-200/60 dark:sm:border-slate-700/60">
            <MetricBar label="Skills Alignment" value={94} color="emerald" showPercent />
            <MetricBar label="Quantified Impact" value={88} color="indigo" showPercent />
            <MetricBar label="Education & Credentials" value={92} color="blue" showPercent />
            <MetricBar label="ATS Formatting" value={87} color="violet" showPercent />
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
              Strong Alignment
            </p>
          </div>
        </div>

        {/* Metric Chip 2: AI Tip */}
        <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-900 dark:text-white block truncate">
              AI Polished
            </span>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 truncate">
              +24% Impact
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Quality Badge & Script Accent */}
      <div className="flex items-center justify-between pt-0.5 px-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800/60 text-[9px] font-semibold text-slate-600 dark:text-slate-400">
          <Award className="w-3 h-3 text-indigo-500" />
          <span>Harvard Standard Parsing</span>
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
