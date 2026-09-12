"use client";

import React, { useState } from "react";
import { InterviewQuestionArtifactData, InterviewQuestionItem } from "@/types/agent";
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp, Send, Sparkles, MessageSquare, AlertCircle } from "lucide-react";

interface InterviewQuestionCardProps {
    data: InterviewQuestionArtifactData;
    onSubmitAnswer?: (answer: string) => void;
    onCancelInterview?: () => void;
    isSubmitting?: boolean;
}

export default function InterviewQuestionCard({
    data,
    onSubmitAnswer,
    onCancelInterview,
    isSubmitting = false,
}: InterviewQuestionCardProps) {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState<string>("");

    if (!data || (!Array.isArray(data.questions) && !data.active_question)) {
        return null;
    }

    const questionsList = Array.isArray(data.questions) ? data.questions : [];
    const activeQuestion =
        questionsList.find((q) => q.isActive) ||
        data.active_question ||
        (data.session && data.session.status === "in_progress" && questionsList.length > 0
            ? questionsList[questionsList.length - 1]
            : null);

    const isSessionActive = Boolean(
        activeQuestion && (Boolean((activeQuestion as InterviewQuestionItem).isActive) || onSubmitAnswer || data.session?.status === "in_progress")
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = answerText.trim();
        if (!trimmed || isSubmitting || !onSubmitAnswer) return;
        onSubmitAnswer(trimmed);
        setAnswerText("");
    };

    const toggleExpand = (id: string) => {
        setExpandedQuestionId((prev) => (prev === id ? null : id));
    };

    // ACTIVE QUESTION VIEW
    if (isSessionActive && activeQuestion) {
        const currentIndex = (data.session?.questionIndex ?? 0) + 1;
        const totalPlanned = 5; // standard target length
        const isFollowUp = data.is_follow_up || (activeQuestion.id && String(activeQuestion.id).includes("followup"));

        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-sm space-y-4">
                {/* Header & Progress */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="w-4 h-4" />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {isFollowUp ? "Follow-Up Question" : `Question ${currentIndex}`}
                                </h3>
                                {isFollowUp && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                        Follow-Up
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Mock Interview in progress
                            </p>
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {Array.from({ length: totalPlanned }).map((_, i) => (
                            <span
                                key={i}
                                className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
                                    i < currentIndex
                                        ? "bg-indigo-600 dark:bg-indigo-400"
                                        : "bg-slate-200 dark:bg-slate-700"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Active Question Content */}
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                        {activeQuestion.difficulty && (
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    activeQuestion.difficulty === "Hard" || activeQuestion.difficulty === "advanced"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                        : activeQuestion.difficulty === "Medium" || activeQuestion.difficulty === "intermediate"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                }`}
                            >
                                {activeQuestion.difficulty}
                            </span>
                        )}
                        {activeQuestion.category && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                • {activeQuestion.category}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {activeQuestion.question}
                    </p>
                </div>

                {/* Answer Form */}
                {onSubmitAnswer && (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>Your Answer</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                    Tip: Structure with Situation, Action & Result
                                </span>
                            </label>
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Type your detailed answer here..."
                                rows={4}
                                disabled={isSubmitting}
                                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:opacity-50"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            {onCancelInterview ? (
                                <button
                                    type="button"
                                    onClick={onCancelInterview}
                                    className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                >
                                    Cancel Interview
                                </button>
                            ) : <div />}

                            <button
                                type="submit"
                                disabled={!answerText.trim() || isSubmitting}
                                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {isSubmitting ? "Evaluating..." : "Submit Answer"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    // SPRINT 8 READ-ONLY LIST VIEW (PRESERVED UNCHANGED)
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Interview Prep Questions
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {questionsList.length} practice question{questionsList.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {questionsList.map((q, idx) => {
                    const qId = q.id || `q-${idx}`;
                    const isExpanded = expandedQuestionId === qId;

                    return (
                        <div
                            key={qId}
                            className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {q.difficulty && (
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    q.difficulty === "Hard"
                                                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                                        : q.difficulty === "Medium"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                }`}
                                            >
                                                {q.difficulty}
                                            </span>
                                        )}
                                        {q.category && (
                                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                • {q.category}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                                        Q{idx + 1}: {q.question}
                                    </h4>
                                </div>

                                {q.keyTips && q.keyTips.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(qId)}
                                        aria-label={isExpanded ? "Hide key tips" : "Show key tips"}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            {/* Key Tips Collapsible */}
                            {isExpanded && q.keyTips && q.keyTips.length > 0 && (
                                <div className="mt-3 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in duration-150">
                                    <p className="font-semibold flex items-center gap-1">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                        Key Tips for Answer:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                                        {q.keyTips.map((tip, tIdx) => (
                                            <li key={tIdx}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
