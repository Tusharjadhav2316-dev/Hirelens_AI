import React from "react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface AIMatchingPromoCardProps {
  onActivateAIMatching: () => void;
}

export default function AIMatchingPromoCard({
  onActivateAIMatching,
}: AIMatchingPromoCardProps) {
  return (
    <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
      <div className="flex items-start gap-3.5 mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Job Matching
            </h3>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              New
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Match your active resume against targeted job descriptions for instant ATS scoring and gap analysis.
          </p>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 pl-1">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Real-time keyword gap analysis</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Section-by-section alignment</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>AI-driven resume tailoring tips</span>
        </div>
      </div>

      <button
        onClick={onActivateAIMatching}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-[0.98] transition cursor-pointer"
      >
        <span>Find AI Matched Jobs</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
