"use client";

import React from "react";
import ATSScorePanel from "@/components/resume-builder/ATSScorePanel";
import { ATSScoreArtifactData } from "@/types/agent";
import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";

interface ATSScoreCardProps {
    data: ATSScoreArtifactData | any;
    onImproveResume?: () => void;
}

export default function ATSScoreCard({ data, onImproveResume }: ATSScoreCardProps) {
    if (!data) {
        return (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                ATS result data unavailable.
            </div>
        );
    }

    const rawResult = data.result || data;
    const overallScore = rawResult.overallScore ?? rawResult.finalScore ?? rawResult.score ?? 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            ATS Score Analysis
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Deterministic ATS Engine Result
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                        Score: {overallScore}/100
                    </span>

                    {onImproveResume && (
                        <button
                            onClick={onImproveResume}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition-colors shadow-xs"
                        >
                            <span>Improve Resume</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {data.explanation && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{data.explanation}</p>
                </div>
            )}

            {/* Reuses existing ATSScorePanel component without modifying it */}
            <ATSScorePanel result={rawResult} />
        </div>
    );
}
