"use client";

import React, { useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";

export default function ActivityOverviewCard() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  return (
    <div className="flex flex-col h-full rounded-2xl p-5 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Card Header & Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Activity Overview
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Application and interview activity trends
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
          >
            {timeRange}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Legend Indicators matching PDF Page 8 */}
      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Profile Views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Applications</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Interviews</span>
        </div>
      </div>

      {/* Chart Canvas Area with Honest Empty State */}
      <div className="flex-1 flex flex-col justify-between rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 p-4 min-h-[160px]">
        {/* Subtle grid lines background */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 relative">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
            <BarChart3 className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No activity recorded yet
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[240px] mt-1 leading-relaxed">
            Activity trends will appear here once you submit applications and complete interview sessions.
          </p>
        </div>

        {/* Timeline Axis Markers */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/80 pt-2 px-1">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>
    </div>
  );
}
