import React from "react";
import { Play, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface StartInterviewBarProps {
  targetRole: string;
  interviewType: string;
  difficulty: string;
  questionCount: number;
  isLoading: boolean;
  onStartInterview: () => void;
}

export default function StartInterviewBar({
  targetRole,
  interviewType,
  difficulty,
  questionCount,
  isLoading,
  onStartInterview,
}: StartInterviewBarProps) {
  return (
    <div className="relative overflow-hidden p-5 sm:p-6 mb-8 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/15 text-white backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              Ready to begin simulation for {targetRole || "your target role"}?
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-100/90 pl-8">
            <span className="capitalize">{interviewType.replace("_", " ")}</span>
            <span>•</span>
            <span className="capitalize">{difficulty}</span>
            <span>•</span>
            <span>{questionCount} Questions</span>
            <span>•</span>
            <span>Live Voice & Delivery Analysis</span>
          </div>
        </div>

        <button
          onClick={onStartInterview}
          disabled={isLoading || !targetRole.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Generating Session...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-indigo-900" />
              <span>Start Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
