"use client";

import React, { useState } from "react";
import { TrainerInterviewReportArtifactData } from "@/types/agent";
import { Award, CheckCircle2, AlertCircle, Sparkles, Mic, Video, Trash2, RotateCcw, ShieldCheck } from "lucide-react";

interface TrainerInterviewReportProps {
    data: TrainerInterviewReportArtifactData;
    onStartNewSession?: () => void;
    onDeleteSession?: () => void;
}

export default function TrainerInterviewReport({
    data,
    onStartNewSession,
    onDeleteSession,
}: TrainerInterviewReportProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!data) {
        return (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                Interview report data is unavailable.
            </div>
        );
    }

    const {
        target_role,
        training_mode,
        questions_asked,
        readiness_by_category = {},
        strengths = [],
        improvement_areas = [],
        priority_topics = [],
        communication_summary,
        visual_summary,
        note,
    } = data;

    const getReadinessBadge = (level: string) => {
        switch (level?.toLowerCase()) {
            case "strong":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            case "moderate":
                return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
            case "needs improvement":
            default:
                return "bg-amber-500/10 text-amber-400 border-amber-500/30";
        }
    };

    return (
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 backdrop-blur-md space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">{target_role} Interview Report</h2>
                        <p className="text-xs text-slate-400">
                            {training_mode === "coaching" ? "Interactive Coaching Session" : "Realistic Mock Interview"} • {questions_asked} Questions Completed
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                        Session Complete
                    </span>
                </div>
            </div>

            {/* Category Readiness Breakdown (Strictly Qualitative) */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Readiness by Competency Area
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(readiness_by_category).map(([category, level], idx) => (
                        <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-300 capitalize">{category}</span>
                            <span className={`px-2 py-0.5 text-[11px] font-semibold border rounded-full ${getReadinessBadge(level)}`}>
                                {level}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths & Improvement Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Key Strengths */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Demonstrated Strengths
                    </span>
                    <ul className="space-y-2 text-slate-300">
                        {strengths.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Growth Opportunities */}
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Priority Improvement Areas
                    </span>
                    <ul className="space-y-2 text-slate-300">
                        {improvement_areas.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Communication & Speech Delivery Observations */}
            {communication_summary && (
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-indigo-400" />
                        Speech & Delivery Summary
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Average Pace</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {communication_summary.avg_words_per_minute ? `${communication_summary.avg_words_per_minute} WPM` : "N/A"}
                            </span>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Total Filler Words</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {communication_summary.total_fillers ?? 0}
                            </span>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-400 block">Pace Assessment</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {communication_summary.pace_assessment || "Balanced"}
                            </span>
                        </div>
                    </div>
                    {communication_summary.actionable_tip && (
                        <p className="text-slate-300 pt-1 leading-relaxed">
                            💡 <strong>Delivery Tip:</strong> {communication_summary.actionable_tip}
                        </p>
                    )}
                </div>
            )}

            {/* Visual Framing Summary (ONLY IF CAMERA WAS ENABLED) */}
            {visual_summary?.camera_enabled && (
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-indigo-400" />
                        Visual Presence & On-Screen Framing
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                        <span>{visual_summary.framing_note || "Centered on-screen"}</span>
                        <span className="text-slate-400">
                            In-frame ratio: {Math.round((visual_summary.face_detected_ratio ?? 1) * 100)}%
                        </span>
                    </div>
                </div>
            )}

            {/* Disclaimer & Privacy Guarantee Note */}
            <div className="flex items-start gap-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                    {note || "This report provides qualitative coaching observations for personal preparation. It does not calculate arbitrary numeric confidence scores or predict employer hiring decisions."}
                </p>
            </div>

            {/* Bottom Action Affordances */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                        <span className="text-red-400 font-medium">Delete this session permanently?</span>
                        <button
                            type="button"
                            onClick={onDeleteSession}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded"
                        >
                            Yes, Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Session</span>
                    </button>
                )}

                {onStartNewSession && (
                    <button
                        type="button"
                        onClick={onStartNewSession}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Start New Session</span>
                    </button>
                )}
            </div>
        </div>
    );
}
