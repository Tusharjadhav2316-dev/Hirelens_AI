"use client";

import React from "react";
import { InterviewSetupSummaryArtifactData } from "@/types/agent";
import { Sparkles, Briefcase, CheckCircle2, Shield, Mic, Video } from "lucide-react";

interface InterviewSetupSummaryProps {
    data: InterviewSetupSummaryArtifactData;
    onStartInterview?: () => void;
}

export default function InterviewSetupSummary({ data, onStartInterview }: InterviewSetupSummaryProps) {
    if (!data || !data.role_intelligence) {
        return (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                Setup summary data is unavailable.
            </div>
        );
    }

    const { role_intelligence, training_mode, difficulty, voice_enabled, camera_enabled } = data;

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">{role_intelligence.target_role}</h3>
                        <p className="text-xs text-slate-400">Role Intelligence & Interview Plan</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 capitalize">
                        {training_mode === "coaching" ? "Interactive Coaching" : "Realistic Mock"}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                        {difficulty}
                    </span>
                </div>
            </div>

            {/* Role Summary */}
            <div className="mb-4 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <p>{role_intelligence.role_summary}</p>
            </div>

            {/* Competencies & Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                {/* Likely Competencies */}
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-slate-300 mb-2 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Target Competencies
                    </span>
                    <ul className="space-y-1">
                        {role_intelligence.likely_competencies.map((comp, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-slate-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>{comp}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Interview Categories & Weights */}
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-slate-300 mb-2 block flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        Category Weighting
                    </span>
                    <div className="space-y-1.5">
                        {role_intelligence.interview_categories.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between text-slate-400">
                                <span className="capitalize">{cat.category}</span>
                                <span className="font-medium text-slate-300">{Math.round(cat.weight * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Media Setup Indicators & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Mic className={`w-3.5 h-3.5 ${voice_enabled ? "text-emerald-400" : "text-slate-500"}`} />
                        <span>Voice {voice_enabled ? "Enabled" : "Off"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Video className={`w-3.5 h-3.5 ${camera_enabled ? "text-emerald-400" : "text-slate-500"}`} />
                        <span>Camera {camera_enabled ? "Enabled" : "Off"}</span>
                    </span>
                </div>

                {onStartInterview && (
                    <button
                        type="button"
                        onClick={onStartInterview}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-md"
                    >
                        Enter Interview Room
                    </button>
                )}
            </div>
        </div>
    );
}
