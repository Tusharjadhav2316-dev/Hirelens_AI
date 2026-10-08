"use client";

import ScoreRing from "@/components/common/ScoreRing";
import MetricBar from "@/components/common/MetricBar";

interface CategoryScore {
  label: string;
  score: number;
  weight?: string;
}

interface ATSScoreCardProps {
  score: number;
  categories: CategoryScore[];
  statusLabel?: string;
  scoringMode?: "Quality" | "Match";
}

export default function ATSScoreCard({
  score,
  categories,
  statusLabel,
  scoringMode = "Match",
}: ATSScoreCardProps) {
  const getStatusInfo = (val: number) => {
    if (val >= 85) {
      return {
        text: statusLabel || "Excellent Match",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      };
    }
    if (val >= 70) {
      return {
        text: statusLabel || "Good Match",
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      };
    }
    if (val >= 50) {
      return {
        text: statusLabel || "Fair Match",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      };
    }
    return {
      text: statusLabel || "Needs Improvement",
      className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    };
  };

  const status = getStatusInfo(score);

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {scoringMode === "Match" ? "ATS Match Score" : "ATS Quality Score"}
          </h3>
        </div>
      </div>

      {/* Donut & Status Pill */}
      <div className="flex flex-col items-center justify-center py-2">
        <ScoreRing score={score} size="xl" />

        <div className="mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 flex-1">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Section Breakdown
        </h4>

        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const barColor =
              cat.score >= 80 ? "emerald" : cat.score >= 60 ? "amber" : "rose";

            return (
              <div key={idx} className="space-y-1">
                <MetricBar
                  label={cat.label}
                  value={cat.score}
                  color={barColor}
                  showPercent={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
