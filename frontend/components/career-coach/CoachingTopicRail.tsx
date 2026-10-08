import React from "react";
import {
  Compass,
  Code2,
  Briefcase,
  ArrowRightLeft,
  DollarSign,
  BarChart3,
  Award,
  Zap,
  ChevronRight,
} from "lucide-react";
import { CAREER_COACH_TOPICS, CareerCoachTopicConfig } from "./CareerCoachConfig";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Code2,
  Briefcase,
  ArrowRightLeft,
  DollarSign,
  BarChart3,
  Award,
  Zap,
};

interface CoachingTopicRailProps {
  selectedTopicId: string;
  onSelectTopic: (topic: CareerCoachTopicConfig) => void;
}

export default function CoachingTopicRail({
  selectedTopicId,
  onSelectTopic,
}: CoachingTopicRailProps) {
  const topicsList = Object.values(CAREER_COACH_TOPICS);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Coaching Topics
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Select a focus to tailor advice
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          8 Topics
        </span>
      </div>

      <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {topicsList.map((topic) => {
          const isSelected = topic.id === selectedTopicId;
          const IconComp = ICON_MAP[topic.iconName] || Compass;

          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`w-full group text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between border cursor-pointer ${
                isSelected
                  ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 text-blue-900 dark:text-blue-100 shadow-2xs"
                  : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80 border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? "text-blue-950 dark:text-blue-100 font-bold"
                          : "text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {topic.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {topic.tagline}
                  </p>
                </div>
              </div>

              <ChevronRight
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400 translate-x-0.5"
                    : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
