import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";

interface AIImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    originalText: string;
    improvedText: string;
    isImproving: boolean;
}

export default function AIImprovementModal({
    isOpen,
    onClose,
    onAccept,
    originalText,
    improvedText,
    isImproving
}: AIImprovementModalProps) {

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
                        <div className="flex-1 p-4 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed relative">
                            {isImproving ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-[1px] rounded-lg">
                                    <div className="flex gap-1 items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            ) : (
                                improvedText
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="shrink-0 flex sm:justify-between items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isImproving}
                        className="w-full sm:w-auto text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        type="button"
                        onClick={onAccept}
                        disabled={isImproving || !improvedText}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
