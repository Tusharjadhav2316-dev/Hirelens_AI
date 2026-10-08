import React from "react";
import { Headphones, Layers, MessageSquareQuote, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export type PracticeMode = "mock" | "topic" | "feedback";

interface PracticeModesRowProps {
  selectedMode: PracticeMode;
  onSelectMode: (mode: PracticeMode) => void;
}

export default function PracticeModesRow({
  selectedMode,
  onSelectMode,
}: PracticeModesRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Mock Interview Card */}
      <div
        onClick={() => onSelectMode("mock")}
        className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          selectedMode === "mock"
            ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-500/30"
            : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            {selectedMode === "mock" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                Active
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mock Interview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Full-length live interview simulation with adaptive voice turn-taking and post-session qualitative reports.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Practice by Topic Card */}
      <div
        onClick={() => onSelectMode("topic")}
        className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          selectedMode === "topic"
            ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-500/30"
            : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            {selectedMode === "topic" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                Active
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Practice by Topic
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Target specific competencies like system design, algorithm optimization, or behavioral STAR frameworks.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Get Feedback Card */}
      <div
        onClick={() => onSelectMode("feedback")}
        className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          selectedMode === "feedback"
            ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-500/30"
            : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            {selectedMode === "feedback" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                Active
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Get Feedback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Instant analysis on delivery clarity, speech filler rate, structural soundness, and technical depth.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Why Practice with AI? Checklist Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Why Practice with AI?
          </h3>
        </div>
        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Adaptive question difficulty</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Real-time voice pacing & fillers</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Objective role rubric scoring</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>100% private in-browser audio</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
