import React, { useRef, useEffect } from "react";
import {
  Compass,
  Sparkles,
  User,
  Bot,
  Target,
  Code2,
  Calendar,
  TrendingUp,
  Briefcase,
  Users,
  Award,
  Zap,
  BarChart3,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { CoachMessage, RoadmapStep, CareerRoadmap } from "./CareerCoachTypes";
import InteractiveRoadmapCard from "./InteractiveRoadmapCard";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Code2,
  Calendar,
  TrendingUp,
  Briefcase,
  Users,
  Award,
  Zap,
  BarChart3,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  Compass,
  Sparkles,
};

interface CareerCoachConversationProps {
  topicName: string;
  greetingText: string;
  suggestedPrompts: { iconName: string; text: string }[];
  roadmap: CareerRoadmap;
  messages: CoachMessage[];
  onSuggestionClick: (promptText: string) => void;
  onViewRoadmapDetails: () => void;
  onSelectRoadmapStep?: (step: RoadmapStep) => void;
}

export default function CareerCoachConversation({
  topicName,
  greetingText,
  suggestedPrompts,
  roadmap,
  messages,
  onSuggestionClick,
  onViewRoadmapDetails,
  onSelectRoadmapStep,
}: CareerCoachConversationProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar min-h-0">
      {/* 1. Coach Initial Greeting Bubble (Topic-Specific) */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
          <Bot className="w-4 h-4" />
        </div>
        <div className="space-y-3 max-w-[92%] sm:max-w-[88%]">
          <div className="rounded-2xl rounded-tl-none p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-2 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HireLens Career Strategist • {topicName}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-100 font-medium">
              {greetingText}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Explore the <strong>{roadmap.roleTitle}</strong> below, or tap a suggested prompt to dive deeper into your strategic execution.
            </p>
          </div>

          {/* 2. Topic-Specific Prompt Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((sug, i) => {
              const IconComp = ICON_MAP[sug.iconName] || Sparkles;
              return (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(sug.text)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200/80 dark:border-slate-700/80 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
                >
                  <IconComp className="w-3.5 h-3.5 text-blue-500" />
                  <span>{sug.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Hero Interactive Career Roadmap Card (Dynamic per Topic) */}
      <div className="pl-0 sm:pl-11">
        <InteractiveRoadmapCard
          roadmap={roadmap}
          onViewDetails={onViewRoadmapDetails}
          onSelectStep={onSelectRoadmapStep}
        />
      </div>

      {/* 4. Chat Messages Stream */}
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium text-xs shadow-xs ${
                isUser
                  ? "bg-blue-600"
                  : "bg-slate-800 dark:bg-slate-700"
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-2xs whitespace-pre-wrap"
              }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}

      <div ref={scrollRef} />
    </div>
  );
}
