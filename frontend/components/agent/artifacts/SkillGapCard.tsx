"use client";

import React from "react";
import { SkillGapArtifactData } from "@/types/agent";
import { CheckCircle2, XCircle, Target, Sparkles } from "lucide-react";

interface SkillGapCardProps {
    data: SkillGapArtifactData;
}

export default function SkillGapCard({ data }: SkillGapCardProps) {
    if (!data) return null;

    const matchScore = Math.round(data.matchScore || 0);
    const matched = data.matchedKeywords || [];
    const missing = data.missingKeywords || [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Skill Gap Analysis
                        </h3>
                        {data.targetRole && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Target Role: <span className="font-semibold">{data.targetRole}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {matchScore}%
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Match Score</p>
                </div>
            </div>

            {/* Matched Keywords */}
            <div>
                <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matched Skills ({matched.length})
                </h4>
                {matched.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No matched skills detected yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {matched.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                            >
                                ✓ {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Missing Keywords */}
            <div>
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                    Missing / Skill Gaps ({missing.length})
                </h4>
                {missing.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium">✓ No missing skills! Great job.</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {missing.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40"
                            >
                                ✕ {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
