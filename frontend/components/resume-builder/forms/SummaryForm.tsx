"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, FileText } from "lucide-react";
import { improveSection } from "@/lib/aiService";
import { OptimizerMode } from "@/lib/promptTemplates";
import AIImprovementModal from "../AIImprovementModal";
import OptimizerModeSelector from "../OptimizerModeSelector";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    summary: string;
    onChange: (summary: string) => void;
    jobDescription?: string;
}

export default function SummaryForm({ summary, onChange, jobDescription }: Props) {
    const { user } = useAuth();
    const [selectedMode, setSelectedMode] = useState<OptimizerMode>("ats");
    const [isImproving, setIsImproving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [improvedText, setImprovedText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const hasJd = !!jobDescription && jobDescription.trim().length >= 20;

    const handleImproveSummary = async () => {
        const currentSummary = summary?.trim();
        if (!currentSummary || currentSummary.length < 10) {
            setError("Please write at least a few words before enhancing.");
            return;
        }

        if (selectedMode === "jd-align" && !hasJd) {
            setError("A Job Description (at least 20 characters) is required for JD Tailored mode.");
            return;
        }

        setError(null);
        setIsImproving(true);
        setModalOpen(true);
        setImprovedText("");

        try {
            const token = await user?.getIdToken() || "";
            const improved = await improveSection("summary", currentSummary, token, jobDescription, selectedMode);
            setImprovedText(improved);
        } catch (err: any) {
            setModalOpen(false);
            setError(err.message || "Failed to improve summary.");
        } finally {
            setIsImproving(false);
        }
    };

    const handleAcceptImprovement = (finalText: string) => {
        if (finalText) {
            onChange(finalText);
        }
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setImprovedText("");
    };

    const wordCount = summary ? summary.trim().split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Professional Summary
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Craft a concise, impactful 2–4 sentence summary highlighting your strengths.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImproveSummary}
                    disabled={isImproving}
                    className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors font-semibold"
                >
                    <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isImproving ? "animate-pulse" : ""}`} />
                    {isImproving ? "Enhancing..." : "Improve with AI"}
                </Button>
            </div>

            <OptimizerModeSelector
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                hasJd={hasJd}
                disabled={isImproving}
            />

            {error && (
                <div className="text-xs text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl border border-red-200/60 dark:border-red-800/40">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <Label htmlFor="summary-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Summary Text
                    </Label>
                    <span>{wordCount} words (ideal: 20–60)</span>
                </div>
                <textarea
                    id="summary-textarea"
                    value={summary}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    className="w-full flex rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500 transition-colors custom-scrollbar leading-relaxed"
                    placeholder="Passionate and results-driven software engineer with expertise in modern full-stack web technologies, distributed architectures, and AI systems. Seeking opportunities to drive impactful product innovation..."
                />
            </div>

            <AIImprovementModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onAccept={handleAcceptImprovement}
                onRegenerate={() => handleImproveSummary()}
                originalText={summary || ""}
                improvedText={improvedText}
                isImproving={isImproving}
                optimizationMode={selectedMode}
                isJdActive={!!jobDescription}
            />
        </div>
    );
}
