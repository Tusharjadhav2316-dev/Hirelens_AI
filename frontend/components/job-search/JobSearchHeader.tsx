import React from "react";
import { Briefcase, ClipboardList } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";

interface JobSearchHeaderProps {
  onTrackApplicationsClick: () => void;
  applicationsCount?: number;
}

export default function JobSearchHeader({
  onTrackApplicationsClick,
  applicationsCount = 0,
}: JobSearchHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start gap-4">
        <IconTile icon={Briefcase} variant="indigo" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Job </span>
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                Search
              </span>
            </h1>
            <div className="hidden lg:block ml-2">
              <ScriptAccent text="Same You. Bigger Opportunities." showFlourish={false} />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Discover high-alignment opportunities curated for your technical profile, skill matches, and compensation targets.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
        <button
          onClick={onTrackApplicationsClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <ClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Track Applications</span>
          {applicationsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {applicationsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
