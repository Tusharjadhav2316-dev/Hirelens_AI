import React from "react";
import { Users, History } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";

interface InterviewTrainerHeaderProps {
  onViewHistoryClick: () => void;
  sessionCount?: number;
}

export default function InterviewTrainerHeader({
  onViewHistoryClick,
  sessionCount = 0,
}: InterviewTrainerHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start gap-4">
        <IconTile icon={Users} variant="violet" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Interview </span>
              <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-600 dark:from-purple-400 dark:via-indigo-300 dark:to-indigo-400 bg-clip-text text-transparent">
                Trainer
              </span>
            </h1>
            <div className="hidden lg:block ml-2">
              <ScriptAccent text="Same You. Bigger Opportunities." showFlourish={false} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Simulate high-stakes technical, behavioral, and leadership interviews with real-time AI evaluation, voice turn-taking, and delivery analytics.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
        <button
          onClick={onViewHistoryClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <History className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>View Practice History</span>
          {sessionCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              {sessionCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
