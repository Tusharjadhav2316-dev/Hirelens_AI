"use client";

import React, { useState } from "react";
import { ResumeDiffArtifactData } from "@/types/agent";
import { useResume } from "@/contexts/ResumeContext";
import { Resume } from "@/types/resume";
import { FileEdit, Check, X, Sparkles, AlertCircle } from "lucide-react";

interface ResumeDiffCardProps {
    data: ResumeDiffArtifactData;
}

/**
 * Pure section-aware mutation adapter that updates the target section of a Resume object.
 * Returns a new Resume object on valid mutation, or the original resume unchanged if unsupported or malformed.
 */
export function applyResumeDiff(currentResume: Resume, diff: ResumeDiffArtifactData): Resume {
    if (!diff || typeof diff !== "object" || !diff.section || typeof diff.after !== "string") {
        console.warn("[applyResumeDiff] Malformed diff payload - resume unchanged.", diff);
        return currentResume;
    }

    const normSection = diff.section.toLowerCase().trim();

    switch (normSection) {
        case "summary":
        case "personalinfo": {
            return {
                ...currentResume,
                personalInfo: {
                    ...currentResume.personalInfo,
                    summary: diff.after,
                },
            };
        }

        case "experience": {
            if (!diff.itemId) {
                console.warn("[applyResumeDiff] Experience diff missing itemId - resume unchanged.");
                return currentResume;
            }
            const exists = currentResume.experience?.some(item => item.id === diff.itemId);
            if (!exists) {
                console.warn(`[applyResumeDiff] Experience item '${diff.itemId}' not found - resume unchanged.`);
                return currentResume;
            }
            return {
                ...currentResume,
                experience: currentResume.experience.map(item =>
                    item.id === diff.itemId ? { ...item, description: diff.after } : item
                ),
            };
        }

        case "projects": {
            if (!diff.itemId) {
                console.warn("[applyResumeDiff] Projects diff missing itemId - resume unchanged.");
                return currentResume;
            }
            const exists = currentResume.projects?.some(item => item.id === diff.itemId);
            if (!exists) {
                console.warn(`[applyResumeDiff] Project item '${diff.itemId}' not found - resume unchanged.`);
                return currentResume;
            }
            return {
                ...currentResume,
                projects: currentResume.projects.map(item =>
                    item.id === diff.itemId ? { ...item, description: diff.after } : item
                ),
            };
        }

        case "achievements": {
            if (!diff.itemId) {
                console.warn("[applyResumeDiff] Achievements diff missing itemId - resume unchanged.");
                return currentResume;
            }
            const exists = currentResume.achievements?.some(item => item.id === diff.itemId);
            if (!exists) {
                console.warn(`[applyResumeDiff] Achievement item '${diff.itemId}' not found - resume unchanged.`);
                return currentResume;
            }
            return {
                ...currentResume,
                achievements: currentResume.achievements.map(item =>
                    item.id === diff.itemId ? { ...item, description: diff.after } : item
                ),
            };
        }

        case "certifications": {
            if (!diff.itemId) {
                console.warn("[applyResumeDiff] Certifications diff missing itemId - resume unchanged.");
                return currentResume;
            }
            const exists = currentResume.certifications?.some(item => item.id === diff.itemId);
            if (!exists) {
                console.warn(`[applyResumeDiff] Certification item '${diff.itemId}' not found - resume unchanged.`);
                return currentResume;
            }
            return {
                ...currentResume,
                certifications: currentResume.certifications.map(item =>
                    item.id === diff.itemId ? { ...item, name: diff.after } : item
                ),
            };
        }

        default: {
            console.warn(`[applyResumeDiff] Unsupported section '${diff.section}' - resume unchanged.`);
            return currentResume;
        }
    }
}

export default function ResumeDiffCard({ data }: ResumeDiffCardProps) {
    const { resume, setResume } = useResume();
    const [decision, setDecision] = useState<"pending" | "applied" | "rejected">("pending");

    if (!data) return null;

    const handleApplyClick = () => {
        if (decision !== "pending") return;
        const updatedResume = applyResumeDiff(resume, data);
        setResume(updatedResume);
        setDecision("applied");
    };

    const handleRejectClick = () => {
        if (decision !== "pending") return;
        setDecision("rejected");
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Proposed Resume Change
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Section: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{data.section || "General"}</span>
                        </p>
                    </div>
                </div>

                {decision === "pending" && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                        Review Required
                    </span>
                )}
                {decision === "applied" && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Applied to Resume
                    </span>
                )}
                {decision === "rejected" && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <X className="w-3 h-3" /> Proposal Rejected
                    </span>
                )}
            </div>

            {/* Rationale */}
            {data.rationale && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Rationale: </span>
                        <span>{data.rationale}</span>
                    </div>
                </div>
            )}

            {/* Diff View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Current */}
                <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40">
                    <p className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 text-[10px]">
                        CURRENT CONTENT:
                    </p>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {data.before || "(Empty)"}
                    </p>
                </div>

                {/* Suggested */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 text-[10px]">
                        SUGGESTED REWRITE:
                    </p>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {data.after || "(Empty)"}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    {decision === "pending" ? "Review proposal before applying" : decision === "applied" ? "Changes reflected in Resume Builder" : "Proposal discarded"}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRejectClick}
                        disabled={decision !== "pending"}
                        aria-label="Reject resume change proposal"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleApplyClick}
                        disabled={decision !== "pending"}
                        aria-label="Apply resume change proposal"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Apply Change
                    </button>
                </div>
            </div>
        </div>
    );
}
