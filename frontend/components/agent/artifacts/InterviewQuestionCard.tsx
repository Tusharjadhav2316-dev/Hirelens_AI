"use client";

import React, { useState } from "react";
import { InterviewQuestionArtifactData } from "@/types/agent";
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface InterviewQuestionCardProps {
    data: InterviewQuestionArtifactData;
}

export default function InterviewQuestionCard({ data }: InterviewQuestionCardProps) {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        return null;
    }

    const toggleExpand = (id: string) => {
        setExpandedQuestionId(prev => prev === id ? null : id);
    };

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
                            {data.questions.length} practice question{data.questions.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {data.questions.map((q, idx) => {
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
