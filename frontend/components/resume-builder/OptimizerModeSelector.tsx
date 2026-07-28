import { OptimizerMode } from "@/lib/promptTemplates";
import { Sparkles, Info } from "lucide-react";

export interface ModeOption {
    id: OptimizerMode;
    label: string;
    description: string;
    requiresJd?: boolean;
}

export const OPTIMIZER_MODES: ModeOption[] = [
    {
        id: "ats",
        label: "ATS Keywords",
        description: "Improve ATS-friendly terminology using skills already present in your resume.",
    },
    {
        id: "impact",
        label: "Impact Focus",
        description: "Strengthen results and outcomes without inventing metrics.",
    },
    {
        id: "concise",
        label: "Make Concise",
        description: "Reduce filler and make the content clearer and shorter.",
    },
    {
        id: "action-verbs",
        label: "Action Verbs",
        description: "Replace weak phrasing with stronger professional action verbs.",
    },
    {
        id: "jd-align",
        label: "JD Tailored",
        description: "Align wording with the target job using only skills and experience you already have.",
        requiresJd: true,
    },
];

interface OptimizerModeSelectorProps {
    selectedMode: OptimizerMode;
    onSelectMode: (mode: OptimizerMode) => void;
    hasJd: boolean;
    disabled?: boolean;
}

export default function OptimizerModeSelector({
    selectedMode,
    onSelectMode,
    hasJd,
    disabled = false,
}: OptimizerModeSelectorProps) {
    const currentOption = OPTIMIZER_MODES.find((m) => m.id === selectedMode) || OPTIMIZER_MODES[0];

    return (
        <div className="space-y-2 my-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Optimization Strategy:
                </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {OPTIMIZER_MODES.map((mode) => {
                    const isJdDisabled = mode.requiresJd && !hasJd;
                    const isSelected = selectedMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            type="button"
                            disabled={disabled || isJdDisabled}
                            onClick={() => onSelectMode(mode.id)}
                            title={isJdDisabled ? "Add a Job Description above (min 20 chars) to use JD Tailored mode" : mode.description}
                            className={`px-2.5 py-1.5 text-xs rounded-md border font-medium transition-all ${
                                isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : isJdDisabled
                                    ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300"
                            }`}
                        >
                            {mode.label}
                            {mode.requiresJd && !hasJd && <span className="ml-1 text-[10px] text-amber-500 font-semibold">🔒</span>}
                        </button>
                    );
                })}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                    {currentOption.description}
                    {currentOption.requiresJd && !hasJd && (
                        <span className="block text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                            ⚠️ Add a Job Description above (at least 20 characters) to unlock JD Tailored mode.
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
