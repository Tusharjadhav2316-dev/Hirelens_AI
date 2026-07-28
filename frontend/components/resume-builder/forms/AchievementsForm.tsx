import { Achievement } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { improveSection } from "@/lib/aiService";
import { OptimizerMode } from "@/lib/promptTemplates";
import AIImprovementModal from "../AIImprovementModal";
import OptimizerModeSelector from "../OptimizerModeSelector";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    data: Achievement[];
    onChange: (data: Achievement[]) => void;
    jobDescription?: string;
}

export default function AchievementsForm({ data, onChange, jobDescription }: Props) {
    const { user } = useAuth();
    const [selectedMode, setSelectedMode] = useState<OptimizerMode>("impact");
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [isImproving, setIsImproving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [improvedText, setImprovedText] = useState("");
    const [errorId, setErrorId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const hasJd = !!jobDescription && jobDescription.trim().length >= 20;

    const handleAdd = () => {
        onChange([
            ...data,
            { id: Date.now().toString(), title: "", description: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter((item) => item.id !== id));
    };

    const handleChange = (id: string, field: keyof Achievement, value: string) => {
        onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const handleImproveSubmit = async (item: Achievement) => {
        const currentDesc = item.description?.trim();
        if (!currentDesc || currentDesc.length < 10) {
            setErrorId(item.id);
            setErrorMsg("Please write a description before optimizing.");
            return;
        }

        if (selectedMode === "jd-align" && !hasJd) {
            setErrorId(item.id);
            setErrorMsg("A Job Description (at least 20 characters) is required for JD Tailored mode.");
            return;
        }

        setErrorId(null);
        setActiveItemId(item.id);
        setIsImproving(true);
        setModalOpen(true);
        setImprovedText("");

        try {
            const token = (await user?.getIdToken()) || "";
            const improved = await improveSection("achievements", currentDesc, token, jobDescription, selectedMode);
            setImprovedText(improved);
        } catch (err: any) {
            setModalOpen(false);
            setErrorId(item.id);
            setErrorMsg(err.message || "Failed to optimize achievement.");
        } finally {
            setIsImproving(false);
        }
    };

    const handleAcceptImprovement = (finalText: string) => {
        if (activeItemId && finalText) {
            handleChange(activeItemId, "description", finalText);
        }
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setActiveItemId(null);
        setImprovedText("");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Achievements</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add awards, honors, or significant accomplishments.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Achievement
                </Button>
            </div>

            <OptimizerModeSelector
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                hasJd={hasJd}
                disabled={isImproving}
            />

            <div className="space-y-6">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 ease-in-out"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-slate-900 dark:text-white">Achievement {index + 1}</h4>
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={item.title}
                                onChange={(e) => handleChange(item.id, "title", e.target.value)}
                                placeholder="e.g. Employee of the Year 2023"
                            />
                            <p className="text-[11px] text-slate-500">The specific name of the award or honor.</p>
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <Label>Description</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleImproveSubmit(item)}
                                    disabled={(isImproving && activeItemId === item.id) || modalOpen}
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 transition-colors"
                                >
                                    <Sparkles className={`w-4 h-4 mr-1.5 ${isImproving && activeItemId === item.id ? "animate-pulse" : ""}`} />
                                    {isImproving && activeItemId === item.id ? "Enhancing..." : "Improve with AI"}
                                </Button>
                            </div>

                            {errorId === item.id && errorMsg && (
                                <div className="text-xs text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 p-2 rounded-md mb-2">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errorMsg}
                                </div>
                            )}

                            <textarea
                                value={item.description}
                                onChange={(e) => handleChange(item.id, "description", e.target.value)}
                                rows={2}
                                className="w-full flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-400 transition-colors"
                                placeholder="Awarded for exceeding sales targets by 150% in Q3..."
                            />
                            <p className="text-[11px] text-slate-500">A brief context about the achievement.</p>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300">
                        No achievements added yet. Click &quot;Add Achievement&quot; to begin.
                    </div>
                )}
            </div>

            <AIImprovementModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onAccept={handleAcceptImprovement}
                onRegenerate={() => {
                    const item = data.find((i) => i.id === activeItemId);
                    if (item) handleImproveSubmit(item);
                }}
                originalText={data.find((i) => i.id === activeItemId)?.description || ""}
                improvedText={improvedText}
                isImproving={isImproving}
                optimizationMode={selectedMode}
                isJdActive={!!jobDescription}
            />
        </div>
    );
}

