import { Certification } from "@/types/resume";
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
    data: Certification[];
    onChange: (data: Certification[]) => void;
    jobDescription?: string;
}

export default function CertificationsForm({ data, onChange, jobDescription }: Props) {
    const { user } = useAuth();
    const [selectedMode, setSelectedMode] = useState<OptimizerMode>("ats");
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
            { id: Date.now().toString(), name: "", issuer: "", year: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter((item) => item.id !== id));
    };

    const handleChange = (id: string, field: keyof Certification, value: string) => {
        onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const getCertificationContent = (item: Certification) => {
        return `${item.name}${item.issuer ? ' | Issued by: ' + item.issuer : ''}${item.year ? ' | Year: ' + item.year : ''}`;
    };

    const handleImproveSubmit = async (item: Certification) => {
        const currentName = item.name?.trim();
        if (!currentName) {
            setErrorId(item.id);
            setErrorMsg("Please enter a certification name before optimizing.");
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
            const content = getCertificationContent(item);
            const improved = await improveSection("certifications", content, token, jobDescription, selectedMode);
            setImprovedText(improved);
        } catch (err: any) {
            setModalOpen(false);
            setErrorId(item.id);
            setErrorMsg(err.message || "Failed to optimize certification.");
        } finally {
            setIsImproving(false);
        }
    };

    // Accept behavior for Certifications: Certification model in types/resume.ts has no description/notes field.
    // The certification name is structured identity data and is preserved as-is.
    // Accepting acknowledges the AI suggestion preview without mutating certification data.
    const handleAcceptImprovement = (finalText: string) => {
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Certifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add professional certifications and licenses.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Certification
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
                            <h4 className="font-medium text-slate-900 dark:text-white">Certification {index + 1}</h4>
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <Label>Certification Name</Label>
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
                                <Input
                                    value={item.name}
                                    onChange={(e) => handleChange(item.id, "name", e.target.value)}
                                    placeholder="e.g. AWS Certified Solutions Architect"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Issuing Organization</Label>
                                <Input
                                    value={item.issuer}
                                    onChange={(e) => handleChange(item.id, "issuer", e.target.value)}
                                    placeholder="e.g. Amazon Web Services"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input
                                    value={item.year || ""}
                                    onChange={(e) => handleChange(item.id, "year", e.target.value)}
                                    placeholder="e.g. 2023"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300">
                        No certifications added yet. Click &quot;Add Certification&quot; to begin.
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
                originalText={(() => {
                    const item = data.find((c) => c.id === activeItemId);
                    return item ? getCertificationContent(item) : "";
                })()}
                improvedText={improvedText}
                isImproving={isImproving}
                optimizationMode={selectedMode}
                isJdActive={!!jobDescription}
            />
        </div>
    );
}

