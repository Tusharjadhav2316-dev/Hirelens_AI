"use client";

import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Wand2, ShieldCheck, Zap } from "lucide-react";
import { ATSFlags } from "@/lib/atsEngine";

interface InsightsCardProps {
  flags: ATSFlags;
  score: number;
  onOpenAiOptimizer: () => void;
  isAiLoading?: boolean;
}

export default function InsightsCard({
  flags,
  score,
  onOpenAiOptimizer,
  isAiLoading = false,
}: InsightsCardProps) {
  // Build dynamic, truthful insight items based on actual engine flags
  const insightItems = [];

  if (flags.noQuantification) {
    insightItems.push({
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
      title: "Missing Metrics",
      desc: "Add percentages (%) and metrics to boost impact.",
      status: "warning",
    });
  } else {
    insightItems.push({
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
      title: "Quantifiable Results",
      desc: "Strong numerical achievements detected.",
      status: "good",
    });
  }

  if (flags.weakVerbs && flags.weakVerbs.length > 0) {
    insightItems.push({
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
      title: "Passive Action Verbs",
      desc: `Found ${flags.weakVerbs.length} weak verbs (${flags.weakVerbs.slice(0, 2).join(", ")}).`,
      status: "bad",
    });
  } else {
    insightItems.push({
      icon: <Zap className="w-3.5 h-3.5 text-indigo-500" />,
      title: "Active Phrasing",
      desc: "Strong action-oriented vocabulary.",
      status: "good",
    });
  }

  if (flags.missingKeywords && flags.missingKeywords.length > 0) {
    insightItems.push({
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
      title: "Keyword Gaps",
      desc: `${flags.missingKeywords.length} high-priority keywords missing.`,
      status: "bad",
    });
  }

  // Suggestions
  const suggestions = [];
  if (flags.missingKeywords && flags.missingKeywords.length > 0) {
    suggestions.push(`Incorporate target skills: ${flags.missingKeywords.slice(0, 3).join(", ")}`);
  }
  if (flags.noQuantification) {
    suggestions.push("Convert job duties into quantified achievements");
  }
  if (flags.weakVerbs && flags.weakVerbs.length > 0) {
    suggestions.push("Replace passive verbs with impactful dynamic verbs");
  }
  if (suggestions.length === 0) {
    suggestions.push("Review formatting alignment for ATS parser compatibility");
    suggestions.push("Tailor resume summary to specific role expectations");
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insights & Actions</h3>
      </div>

      {/* Key Insights List */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Key Insights
        </h4>

        <div className="space-y-2">
          {insightItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-[11.5px]">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Improvement Suggestions
        </h4>

        <div className="space-y-1.5">
          {suggestions.slice(0, 2).map((sug, idx) => (
            <div
              key={idx}
              onClick={onOpenAiOptimizer}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-200 dark:hover:border-indigo-800/80 hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition-all cursor-pointer text-xs"
            >
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                {sug}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Improve with AI Promo Card */}
      <div className="pt-2 mt-auto">
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-sm overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                AI Optimization
              </span>
            </div>
            <p className="text-[11.5px] font-semibold text-white/90 leading-snug">
              Boost your match score with tailored bullet point rewrites and keyword injections.
            </p>
            <button
              type="button"
              onClick={onOpenAiOptimizer}
              disabled={isAiLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Improve with AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
