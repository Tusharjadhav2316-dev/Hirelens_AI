"use client";

import React from "react";
import { FileEdit, Search, Target, Mail, HelpCircle } from "lucide-react";

export interface QuickActionItem {
    id: string;
    label: string;
    description: string;
    prompt: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
    {
        id: "build-resume",
        label: "Build Resume",
        description: "Create or improve your resume",
        prompt: "Help me build a new ATS-optimized resume from scratch",
        icon: FileEdit,
    },
    {
        id: "check-ats",
        label: "Check ATS",
        description: "Analyze your resume quality",
        prompt: "Analyze my current resume for ATS compatibility and score",
        icon: Search,
    },
    {
        id: "find-jobs",
        label: "Find Jobs",
        description: "Get personalized job matches",
        prompt: "Search for relevant job openings matching my profile and skills",
        icon: Target,
    },
    {
        id: "cover-letter",
        label: "Cover Letter",
        description: "Generate tailored cover letters",
        prompt: "Generate a tailored cover letter for my target job",
        icon: Mail,
    },
    {
        id: "prep-interview",
        label: "Prep Interview",
        description: "Practice with AI",
        prompt: "Start an interview prep session with practice questions and feedback",
        icon: HelpCircle,
    },
];

interface QuickActionsProps {
    onSelectAction: (prompt: string) => void;
    disabled?: boolean;
}

export function SuggestedActionCards({ onSelectAction, disabled = false }: QuickActionsProps) {
    return (
        <div className="px-5 py-2.5 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            type="button"
                            onClick={() => onSelectAction(action.prompt)}
                            disabled={disabled}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-50/40 dark:hover:bg-slate-800 text-left transition-all duration-150 shadow-2xs shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 pr-0.5">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight whitespace-nowrap">
                                    {action.label}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5 whitespace-nowrap">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function QuickActions({ onSelectAction, disabled = false }: QuickActionsProps) {
    return <SuggestedActionCards onSelectAction={onSelectAction} disabled={disabled} />;
}


