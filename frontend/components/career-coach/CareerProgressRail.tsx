import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  CircleDot,
  Circle,
  FileCheck,
  Zap,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Target,
  Sparkles,
  Award,
  Code2,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  BarChart3,
  ArrowRightLeft,
  DollarSign,
  MessageSquare,
  Layers,
} from "lucide-react";
import { CareerMilestone, RecommendedArticle } from "./CareerCoachTypes";
import { TopicQuickAction } from "./CareerCoachConfig";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Sparkles,
  FileCheck,
  Award,
  Code2,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  BarChart3,
  ArrowRightLeft,
  DollarSign,
  MessageSquare,
  Layers,
  Zap,
  TrendingUp,
  BookOpen,
};

interface CareerProgressRailProps {
  progressPercentage: number;
  progressPhaseText: string;
  currentMilestoneLabel: string;
  milestones: CareerMilestone[];
  quickActions: TopicQuickAction[];
  recommendedGuides: RecommendedArticle[];
  onQuickAction: (action: TopicQuickAction) => void;
  onReadArticle?: (article: RecommendedArticle) => void;
}

export default function CareerProgressRail({
  progressPercentage,
  progressPhaseText,
  currentMilestoneLabel,
  milestones,
  quickActions,
  recommendedGuides,
  onQuickAction,
  onReadArticle,
}: CareerProgressRailProps) {
  // SVG Circular Donut calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-0.5">
      {/* 1. Your Career Progress Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Your Career Progress
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            {progressPhaseText}
          </span>
        </div>

        {/* Progress Donut & Summary */}
        <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-750">
          <div className="relative w-22 h-22 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-750"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                {progressPercentage}%
              </span>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                On Track
              </span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active Milestone Focus
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {currentMilestoneLabel}
            </p>
          </div>
        </div>

        {/* 5-Stage Milestone Track */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Milestone Pathway
          </h3>
          {milestones.map((m) => {
            const isCompleted = m.status === "completed";
            const isCurrent = m.status === "current";

            return (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                  isCurrent
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80"
                    : isCompleted
                    ? "bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-800"
                    : "bg-slate-50/40 dark:bg-slate-850/40 border-slate-200/40 dark:border-slate-800/40 opacity-75"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <CircleDot className="w-4 h-4 text-blue-600 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {m.stage}. {m.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        isCompleted
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : isCurrent
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Actions 2x2 Grid (Topic-Specific) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Workflows
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map((action) => {
            const IconComp = ICON_MAP[action.iconName] || Zap;

            if (action.actionType === "link" && action.linkHref) {
              return (
                <Link
                  key={action.id}
                  href={action.linkHref}
                  className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer group shadow-2xs block"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 leading-snug">
                    {action.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {action.subtitle}
                  </p>
                </Link>
              );
            }

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onQuickAction(action)}
                className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 leading-snug">
                  {action.title}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {action.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended for You (Topic-Specific) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recommended Guides
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Curated
          </span>
        </div>

        <div className="space-y-3">
          {recommendedGuides.map((art) => (
            <div
              key={art.id}
              onClick={() => onReadArticle && onReadArticle(art)}
              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {art.category}
                </span>
                <span>{art.readTime}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 leading-snug">
                {art.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
                {art.snippet}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-2 group-hover:translate-x-0.5 transition-transform">
                <span>Read guide</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
