"use client";

import React from "react";
import { Pause, Play, LogOut, CheckCircle2 } from "lucide-react";

export type TurnPhase = "SETUP" | "AI_SPEAKING" | "LISTENING" | "PROCESSING" | "FEEDBACK" | "PAUSED" | "COMPLETED";

interface InterviewProgressPanelProps {
    targetRole: string;
    currentIndex: number;
    totalQuestions: number;
    difficulty: string;
    trainingMode: "coaching" | "realistic_mock";
    turnPhase: TurnPhase;
    onTogglePause: () => void;
    onEndInterview: () => void;
}

export const InterviewProgressPanel: React.FC<InterviewProgressPanelProps> = ({
    targetRole,
    currentIndex,
    totalQuestions,
    difficulty,
    trainingMode,
    turnPhase,
    onTogglePause,
    onEndInterview,
}) => {
    const isPaused = turnPhase === "PAUSED";
    const isCompleted = turnPhase === "COMPLETED";
    const progressPercent = Math.min(100, Math.round(((currentIndex + (isCompleted ? 1 : 0)) / Math.max(1, totalQuestions)) * 100));

    const getPhaseBadge = () => {
        switch (turnPhase) {
            case "AI_SPEAKING":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full animate-pulse">AI Trainer Speaking</span>;
            case "LISTENING":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">Listening for Answer</span>;
            case "PROCESSING":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full animate-pulse">Evaluating Response...</span>;
            case "FEEDBACK":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">Feedback Ready</span>;
            case "PAUSED":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-700 text-slate-300 border border-slate-600 rounded-full">Interview Paused</span>;
            case "COMPLETED":
                return <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">Completed</span>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
            {/* Top Row: Role, Mode & Phase */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                    <h2 className="text-sm font-bold text-slate-100">{targetRole}</h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="capitalize">{trainingMode === "coaching" ? "Interactive Coaching" : "Realistic Mock"}</span>
                        <span>•</span>
                        <span className="capitalize">{difficulty}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {getPhaseBadge()}

                    {!isCompleted && (
                        <button
                            type="button"
                            onClick={onTogglePause}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                        >
                            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                            <span>{isPaused ? "Resume" : "Pause"}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onEndInterview}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>End Interview</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar & Counter */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                        Question {isCompleted ? totalQuestions : currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="font-semibold text-slate-300">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
