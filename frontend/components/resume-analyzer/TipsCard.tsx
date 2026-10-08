"use client";

import { CheckCircle2, HelpCircle, ArrowRight, Lightbulb } from "lucide-react";

interface TipsCardProps {
  onSelectSample?: (roleId: string) => void;
}

const TIPS = [
  "Include core technical & domain keywords from the job description",
  "Quantify achievements with metrics (e.g. 40% growth, $1.2M pipeline)",
  "Use standard section headers (Summary, Experience, Skills, Education)",
  "Keep chronological bullet points focused on impact and action verbs",
];

export default function TipsCard({ onSelectSample }: TipsCardProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tips for better results</h2>
      </div>

      {/* Checklist */}
      <div className="flex-1 space-y-2.5">
        {TIPS.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{tip}</span>
          </div>
        ))}
      </div>

      {/* Footer / Need a job description helper */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-[11px] font-semibold text-violet-900 dark:text-violet-200">
              Need a job description?
            </span>
          </div>
          {onSelectSample && (
            <button
              type="button"
              onClick={() => onSelectSample("frontend-dev")}
              className="text-[11px] font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1"
            >
              Try sample <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
