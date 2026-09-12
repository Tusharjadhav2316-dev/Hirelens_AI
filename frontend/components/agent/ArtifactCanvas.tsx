"use client";

import React from "react";
import { Sparkles, Layers, RefreshCw, FileText, TrendingUp, Target, Mail, HelpCircle } from "lucide-react";
import AgentActivityTrace, { TraceStep } from "./AgentActivityTrace";
import ArtifactRenderer from "./ArtifactRenderer";
import { Artifact } from "@/types/agent";

import InterviewSetup, { InterviewConfig } from "./InterviewSetup";

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
    const hasTrace = traceSteps.length > 0;
    const hasContent = Boolean(streamContent && streamContent.trim().length > 0);
    const hasArtifacts = artifacts.length > 0;
    const isEmpty = !hasTrace && !hasContent && !hasArtifacts && !error && !isStreaming && !showInterviewSetup;

    return (
        <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Artifact Canvas
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Structured AI outputs & live activity status
                        </p>
                    </div>
                </div>

                {hasArtifacts && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                        {artifacts.length} Artifact{artifacts.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Canvas Body */}
            <div className="flex-1 flex flex-col gap-6">
                {/* 0. Interview Setup Card (when triggered via Quick Action / user command) */}
                {showInterviewSetup && onStartInterview && (
                    <InterviewSetup
                        onStart={onStartInterview}
                        onCancel={onCancelInterviewSetup}
                    />
                )}

                {/* 1. Empty State */}
                {isEmpty && (
                    <div className="my-auto py-12 px-4 text-center max-w-md mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-6">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            Interactive Artifact Canvas
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Ask me to build, analyze, or improve your resume, find jobs, or prep for an interview — results will show up here.
                        </p>

                        {/* Capability Cards Preview */}
                        <div className="w-full grid grid-cols-1 gap-2.5 text-left">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                                <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">ATS Score Cards</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Deterministic scoring & breakdown</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                                <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Resume Diffs</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Proposed edits with Apply/Reject review</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                                <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Job Matching & Search</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Tailored job listings & skill gap analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Live Agent Activity Trace */}
                {(hasTrace || isStreaming || error) && (
                    <AgentActivityTrace
                        steps={traceSteps}
                        isComplete={!isStreaming && !error}
                        error={error}
                    />
                )}

                {/* 3. Accumulated Generative UI Artifacts */}
                {hasArtifacts && (
                    <div className="space-y-6">
                        {artifacts.map((artifact, idx) => (
                            <ArtifactRenderer
                                key={artifact.id || `artifact-${idx}`}
                                artifact={artifact}
                                onImproveResume={onImproveResume}
                                onSubmitInterviewAnswer={onSubmitInterviewAnswer}
                                onCancelInterview={onCancelInterview}
                                isSubmittingAnswer={isSubmittingAnswer}
                            />
                        ))}
                    </div>
                )}

                {/* 4. Text Content Output Container (Message Delta / Text Results) */}
                {hasContent && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            Agent Output
                        </h4>
                        <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                            {streamContent}
                        </div>
                    </div>
                )}

                {/* 5. Retry Affordance */}
                {error && onRetry && (
                    <div className="mt-2 flex justify-center">
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
