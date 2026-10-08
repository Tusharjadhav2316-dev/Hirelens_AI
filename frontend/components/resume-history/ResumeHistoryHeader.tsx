import React from "react";
import Link from "next/link";
import { Clock, Plus, RefreshCw } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";

interface ResumeHistoryHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ResumeHistoryHeader({
  onRefresh,
  isRefreshing = false,
}: ResumeHistoryHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start gap-4">
        <IconTile icon={Clock} variant="blue" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Resume </span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
                History
              </span>
            </h1>
            <div className="hidden lg:block ml-2">
              <ScriptAccent
                text="Track your growth. Build a better tomorrow."
                showFlourish={false}
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage, compare, and revisit your previous resume versions, ATS score trends, and targeted role drafts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-center">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        )}
        <Link
          href="/dashboard/builder"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Resume</span>
        </Link>
      </div>
    </div>
  );
}
