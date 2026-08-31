"use client";

import React from "react";
import { FileEdit, Search, Target, Mail, HelpCircle, Sparkles } from "lucide-react";

export interface QuickActionItem {
    id: string;
    label: string;
    prompt: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
    {
        id: "build-resume",
        label: "Build Resume",
        prompt: "Help me build a new ATS-optimized resume from scratch",
        icon: FileEdit,
    },
    {
        id: "check-ats",
        label: "Check ATS",
        prompt: "Analyze my current resume for ATS compatibility and score",
        icon: Search,
    },
    {
        id: "find-jobs",
        label: "Find Jobs",
        prompt: "Search for relevant job openings matching my profile and skills",
        icon: Target,
    },
    {
        id: "cover-letter",
        label: "Cover Letter",
        prompt: "Generate a tailored cover letter for my target job",
        icon: Mail,
    },
    {
        id: "prep-interview",
        label: "Prep Interview",
        prompt: "Start an interview prep session with practice questions and feedback",
        icon: HelpCircle,
    },
];

interface QuickActionsProps {
    onSelectAction: (prompt: string) => void;
    disabled?: boolean;
}

export default function QuickActions({ onSelectAction, disabled = false }: QuickActionsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 my-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Quick Actions:
            </span>
            {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                    <button
                        key={action.id}
                        type="button"
                        onClick={() => onSelectAction(action.prompt)}
                        disabled={disabled}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all duration-150 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        <span>[{action.label}]</span>
                    </button>
                );
            })}
        </div>
    );
}
