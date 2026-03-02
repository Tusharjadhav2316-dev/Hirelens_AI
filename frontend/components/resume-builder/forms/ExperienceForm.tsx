import { Experience } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { improveSection } from "@/lib/aiService";
import AIImprovementModal from "../AIImprovementModal";

interface Props {
    data: Experience[];
    onChange: (data: Experience[]) => void;
}

export default function ExperienceForm({ data, onChange }: Props) {
    const [improvingId, setImprovingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [improvedText, setImprovedText] = useState("");
    const [errorId, setErrorId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleAdd = () => {
        onChange([
            ...data,
            { id: Date.now().toString(), company: "", position: "", startDate: "", endDate: "", current: false, description: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter((item) => item.id !== id));
    };

    const handleChange = (id: string, field: keyof Experience, value: string | boolean) => {
        onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const handleImproveSubmit = async (item: Experience) => {
        const currentDesc = item.description?.trim();
        if (!currentDesc || currentDesc.length < 10) {
            setErrorId(item.id);
            setErrorMsg("Please write a bit more description before enhancing.");
            return;
        }

        setErrorId(null);
        setImprovingId(item.id);
        setModalOpen(true);
        setImprovedText("");

        try {
            const improved = await improveSection("experience", currentDesc);
            setImprovedText(improved);
        } catch (err: any) {
            setModalOpen(false);
            setErrorId(item.id);
            setErrorMsg(err.message || "Failed to improve experience.");
        } finally {
            setImprovingId(null);
        }
    };

    const handleAcceptImprovement = () => {
        if (improvingId && improvedText) {
            handleChange(improvingId, "description", improvedText);
        }
        setModalOpen(false);
        setImprovingId(null);
        setImprovedText("");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Work Experience</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add your relevant work experience.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Experience
                </Button>
            </div>

            <div className="space-y-6">
                {data.map((item, index) => (
                    <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 ease-in-out">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-slate-900 dark:text-white">Experience {index + 1}</h4>
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company</Label>
                                <Input value={item.company} onChange={(e) => handleChange(item.id, "company", e.target.value)} placeholder="e.g. Google, Microsoft" />
                            </div>
                            <div className="space-y-2">
                                <Label>Position / Role</Label>
                                <Input value={item.position} onChange={(e) => handleChange(item.id, "position", e.target.value)} placeholder="e.g. Frontend Developer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input value={item.startDate} onChange={(e) => handleChange(item.id, "startDate", e.target.value)} placeholder="e.g. Sep 2021" />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input value={item.endDate} onChange={(e) => handleChange(item.id, "endDate", e.target.value)} placeholder="e.g. Present" disabled={item.current} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`current-${item.id}`}
                                checked={item.current}
                                onChange={(e) => handleChange(item.id, "current", e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
                            />
                            <Label htmlFor={`current-${item.id}`} className="font-normal text-sm text-slate-700 dark:text-slate-300 cursor-pointer">I currently work here</Label>
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <Label>Description / Bullet Points</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleImproveSubmit(item)}
                                    disabled={improvingId === item.id || modalOpen}
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 transition-colors"
                                >
                                    <Sparkles className={`w-4 h-4 mr-1.5 ${improvingId === item.id ? "animate-pulse" : ""}`} />
                                    {improvingId === item.id ? "Enhancing..." : "Improve with AI"}
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
                                rows={4}
                                className="w-full flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-400 transition-colors"
                                placeholder={"• Developed scalable web applications...\n• Increased performance by 15%..."}
                            />
                            <p className="text-[11px] text-slate-500">Briefly describe the project impact and your contribution. Use bullet points.</p>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300">
                        No experience added yet. Click &quot;Add Experience&quot; to begin.
                    </div>
                )}
            </div>

            <AIImprovementModal
                isOpen={modalOpen}
                onClose={() => !improvingId && setModalOpen(false)}
                onAccept={handleAcceptImprovement}
                originalText={data.find(exp => exp.id === improvingId)?.description || improvingId || ""} // Pass improvingId as fallback string if we lose ref
                improvedText={improvedText}
                isImproving={!!improvingId}
            />
        </div>
    );
}
