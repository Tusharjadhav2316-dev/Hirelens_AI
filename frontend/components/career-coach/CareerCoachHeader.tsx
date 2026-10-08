import React from "react";
import { Compass, Sparkles, BookOpen } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";

interface CareerCoachHeaderProps {
  onOpenRoadmap?: () => void;
  activeTopicName?: string;
}

export default function CareerCoachHeader({
  onOpenRoadmap,
  activeTopicName,
}: CareerCoachHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start gap-4">
        <IconTile icon={Compass} variant="blue" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Career </span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
                Coach
              </span>
            </h1>
            <div className="hidden lg:block ml-2">
              <ScriptAccent
                text="Your career. Our guidance. A brighter tomorrow."
                showFlourish={false}
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Your personalized AI career strategist for structured roadmaps, actionable milestone tracking, skill gap identification, and market positioning.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-center">
        {activeTopicName && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Focus: {activeTopicName}</span>
          </div>
        )}
        {onOpenRoadmap && (
          <button
            onClick={onOpenRoadmap}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Full Roadmap</span>
          </button>
        )}
      </div>
    </div>
  );
}
