"use client";

import React from "react";
import { TaskProgressArtifactData } from "@/types/agent";
import { Cpu } from "lucide-react";

interface TaskProgressProps {
    data: TaskProgressArtifactData;
}

export default function TaskProgress({ data }: TaskProgressProps) {
    if (!data) return null;

    const percent = Math.min(100, Math.max(0, data.percent || 0));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {data.label || "Task Progress"}
                    </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {percent}%
                </span>
            </div>

            <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={data.label || "Task progress bar"}
                className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            >
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
