import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";

interface AIImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (finalText: string) => void;
    onRegenerate?: () => void;
    originalText: string;
    improvedText: string;
    isImproving: boolean;
    optimizationMode?: string;
    isJdActive?: boolean;
}

const MODE_LABELS: Record<string, string> = {
    "ats": "ATS Keywords",
    "impact": "Impact Focus",
    "concise": "Make Concise",
    "action-verbs": "Action Verbs",
    "jd-align": "JD Tailored",
};

export default function AIImprovementModal({
    isOpen,
    onClose,
    onAccept,
    onRegenerate,
    originalText,
    improvedText,
    isImproving,
    optimizationMode,
    isJdActive
}: AIImprovementModalProps) {
    const [localImprovedText, setLocalImprovedText] = useState<string>("");

    useEffect(() => {
        if (isImproving) {
            setLocalImprovedText("");
        } else if (improvedText) {
            setLocalImprovedText(improvedText);
        }
    }, [improvedText, isImproving]);

    useEffect(() => {
        if (!isOpen) setLocalImprovedText("");
    }, [isOpen]);

    // Safety against empty rendering
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-6 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <DialogHeader className="mb-4 shrink-0">
                    <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        ✨ AI Optimization Suggestion
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Review the suggested improvements below. The AI has rewritten your content to be more impactful and professional.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-4 mb-6">
                    {/* Original */}
                    <div className="flex-1 flex flex-col min-h-[150px]">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                            Original
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed opacity-70">
                            {originalText}
                        </div>
                    </div>

                    {/* Divider Icon */}
                    <div className="hidden md:flex items-center justify-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Improved */}
                    <div className="flex-1 flex flex-col min-h-[150px]">
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            AI Improved
                            {isImproving && <span className="flex w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                        <div className="flex-1 p-2 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 text-sm text-slate-800 dark:text-slate-200 leading-relaxed relative">
                            {isImproving ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-[1px] rounded-lg z-10">
                                    <div className="flex gap-1 items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            ) : null}
                            <textarea
                                value={localImprovedText}
                                onChange={(e) => setLocalImprovedText(e.target.value)}
                                disabled={isImproving}
                                className="w-full h-full min-h-[160px] p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                placeholder={isImproving ? "Optimizing..." : "Edit the suggestion if needed..."}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        {optimizationMode && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
                                {MODE_LABELS[optimizationMode] ?? optimizationMode}
                            </span>
                        )}
                        {isJdActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                                JD Context
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {onRegenerate && (
                            <button onClick={onRegenerate} disabled={isImproving}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
                                {isImproving ? "..." : "↺ Regenerate"}
                            </button>
                        )}
                        <button onClick={onClose}
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => onAccept(localImprovedText)} disabled={isImproving || !localImprovedText}
                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium transition-colors">
                            Accept Changes
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

