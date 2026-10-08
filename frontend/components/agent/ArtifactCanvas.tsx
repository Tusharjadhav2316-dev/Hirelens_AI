"use client";

import React, { useState } from "react";
import { Sparkles, Layers, TrendingUp, Target, Mail, HelpCircle, FileText } from "lucide-react";
import AgentActivityTrace, { TraceStep } from "./AgentActivityTrace";
import ArtifactRenderer from "./ArtifactRenderer";
import { Artifact } from "@/types/agent";
import InterviewSetup, { InterviewConfig } from "./InterviewSetup";
import { cn } from "@/lib/utils";

interface ArtifactCanvasProps {
    traceSteps: TraceStep[];
    isStreaming: boolean;
    streamContent?: string;
    artifacts?: Artifact[];
    error?: string | null;
    onRetry?: () => void;
    onImproveResume?: () => void;
    onSubmitInterviewAnswer?: (answer: string) => void;
    onCancelInterview?: () => void;
    isSubmittingAnswer?: boolean;
    showInterviewSetup?: boolean;
    onStartInterview?: (config: InterviewConfig) => void;
    onCancelInterviewSetup?: () => void;
}

type FilterCategory = "all" | "resume" | "ats" | "jobs" | "cover_letter" | "interview";

const FILTER_OPTIONS: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "resume", label: "Resume" },
    { id: "ats", label: "ATS" },
    { id: "jobs", label: "Jobs" },
    { id: "cover_letter", label: "Cover Letter" },
    { id: "interview", label: "Interview" },
];

export default function ArtifactCanvas({
    traceSteps,
    isStreaming,
    streamContent = "",
    artifacts = [],
    error = null,
    onRetry,
    onImproveResume,
    onSubmitInterviewAnswer,
    onCancelInterview,
    isSubmittingAnswer = false,
    showInterviewSetup = false,
    onStartInterview,
    onCancelInterviewSetup,
}: ArtifactCanvasProps) {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

    const hasTrace = traceSteps.length > 0;
    const hasContent = Boolean(streamContent && streamContent.trim().length > 0);
    const hasArtifacts = artifacts.length > 0;
    const isEmpty = !hasTrace && !hasContent && !hasArtifacts && !error && !isStreaming && !showInterviewSetup;

    // Filter artifacts by category
    const filteredArtifacts = artifacts.filter((art) => {
        if (activeFilter === "all") return true;
        const type = art.type;
        if (activeFilter === "resume") return type === "resume_preview" || type === "resume_diff";
        if (activeFilter === "ats") return type === "ats_score_card" || type === "skill_gap_card";
        if (activeFilter === "jobs") return type === "job_result_card";
        if (activeFilter === "cover_letter") return type === "cover_letter_preview";
        if (activeFilter === "interview") return type.startsWith("interview") || type.startsWith("trainer");
        return true;
    });


    return (
        <div className="h-full flex flex-col bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 overflow-y-auto custom-scrollbar shadow-xs">
            {/* Artifact Canvas Header matching PDF Page 10 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800 mb-4 gap-3 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shadow-indigo-500/20 shrink-0">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                Artifact Canvas
                            </h2>
                            {hasArtifacts && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                    {artifacts.length} {artifacts.length === 1 ? "Artifact" : "Artifacts"}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Your AI-generated results, documents, and insights.
                        </p>
                    </div>
                </div>

                {/* Filter Chips Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {FILTER_OPTIONS.map((filter) => {
                        const isSelected = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setActiveFilter(filter.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0",
                                    isSelected
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Canvas Body */}
            <div className="flex-1 flex flex-col gap-4">
                {/* 0. Interview Setup Card (when active) */}
                {showInterviewSetup && onStartInterview && (
                    <InterviewSetup
                        onStart={onStartInterview}
                        onCancel={onCancelInterviewSetup}
                    />
                )}

                {/* 1. Live Agent Execution Trace (if active or contains steps) */}
                {hasTrace && (
                    <AgentActivityTrace
                        steps={traceSteps}
                        isComplete={!isStreaming && !error}
                        error={error}
                    />
                )}

                {/* 2. Empty State matching PDF Page 10 guidance */}
                {isEmpty && (
                    <div className="my-auto py-10 px-4 text-center max-w-md mx-auto flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 mb-4">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                            Interactive Artifact Canvas
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Ask AI Agent to build or analyze your resume, scan ATS scores, find matching jobs, or run mock interviews — generated artifacts appear here.
                        </p>

                        {/* Capability Tiles */}
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
                                <TrendingUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">ATS Score Cards</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Compatibility breakdown</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
                                <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Resume Diffs</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Side-by-side optimization</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
                                <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Job Matches</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Tailored open roles</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
                                <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mock Interviews</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">AI practice & feedback</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Rendered Artifacts */}
                {hasArtifacts && (
                    <div className="space-y-4">
                        {filteredArtifacts.length === 0 ? (
                            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 my-6">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    No artifacts found under '{activeFilter}'
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter("all")}
                                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Show all artifacts
                                </button>
                            </div>
                        ) : (
                            filteredArtifacts.map((artifact, idx) => (
                                <ArtifactRenderer
                                    key={artifact.id || `art-${idx}`}
                                    artifact={artifact}
                                    onImproveResume={onImproveResume}
                                    onSubmitInterviewAnswer={onSubmitInterviewAnswer}
                                    onCancelInterview={onCancelInterview}
                                    isSubmittingAnswer={isSubmittingAnswer}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
