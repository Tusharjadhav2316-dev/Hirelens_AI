"use client";

import React, { useState } from "react";
import { TrainerQuestionArtifactData } from "@/types/agent";
import { HelpCircle, Send, CornerDownLeft, Sparkles, MessageSquare } from "lucide-react";

interface TrainerQuestionCardProps {
    data: TrainerQuestionArtifactData;
    onSubmitAnswer?: (answer: string) => void;
    onCancelInterview?: () => void;
    isSubmitting?: boolean;
}

export default function TrainerQuestionCard({
    data,
    onSubmitAnswer,
    onCancelInterview,
    isSubmitting = false,
}: TrainerQuestionCardProps) {
    const [typedAnswer, setTypedAnswer] = useState("");
    const [isTypingMode, setIsTypingMode] = useState(false);

    if (!data) {
        return (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                Question data is unavailable.
            </div>
        );
    }

    const { target_role, question_index, active_question, is_follow_up, difficulty, training_mode } = data;
    const questionText = active_question?.question || `Tell me about your experience relevant to ${target_role}.`;
    const category = active_question?.category || "General";

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!typedAnswer.trim() || isSubmitting) return;
        onSubmitAnswer?.(typedAnswer.trim());
        setTypedAnswer("");
    };

    return (
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 backdrop-blur-md transition-all">
            {/* Question Meta Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                        Q{question_index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{category}</span>
                    {is_follow_up && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">
                            Adaptive Follow-up
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 border border-slate-700 rounded text-slate-300 capitalize">
                        {difficulty}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-300 capitalize">
                        {training_mode === "coaching" ? "Coaching" : "Mock"}
                    </span>
                </div>
            </div>

            {/* Question Body */}
            <div className="mb-5">
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug tracking-tight">
                    {questionText}
                </h3>
            </div>

            {/* Candidate Response Area */}
            <div className="space-y-3">
                {isTypingMode ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <textarea
                            value={typedAnswer}
                            onChange={(e) => setTypedAnswer(e.target.value)}
                            placeholder="Type your structured answer here (STAR format recommended)..."
                            disabled={isSubmitting}
                            rows={4}
                            className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                        />
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsTypingMode(false)}
                                className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                Switch to Voice Response
                            </button>

                            <button
                                type="submit"
                                disabled={!typedAnswer.trim() || isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-md"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmitting ? "Evaluating..." : "Submit Answer"}</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span>Speak naturally using the microphone controls above.</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsTypingMode(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Type Instead</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
