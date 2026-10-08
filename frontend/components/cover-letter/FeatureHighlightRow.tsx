import React from "react";
import { Sparkles, LayoutTemplate, SlidersHorizontal, Target } from "lucide-react";

export default function FeatureHighlightRow() {
  const features = [
    {
      title: "AI Generated",
      description: "Tailored specifically to job requirements with deep context grounding.",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Multiple Templates",
      description: "Choose from Professional, Modern, Minimal, and Creative formats.",
      icon: LayoutTemplate,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40",
      iconBg: "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Fully Customizable",
      description: "Live in-line editing, AI polish, sentence tightening, and impact boosting.",
      icon: SlidersHorizontal,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40",
      iconBg: "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Job Specific",
      description: "Extracts keywords directly from target JDs to maximize alignment.",
      icon: Target,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {features.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`p-4 rounded-2xl border ${item.bg} flex items-start gap-3.5 shadow-2xs`}
          >
            <div
              className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
