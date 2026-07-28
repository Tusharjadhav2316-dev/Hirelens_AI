import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { improveSection } from "@/lib/aiService";
import AIImprovementModal from "../AIImprovementModal";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    data: PersonalInfo;
    onChange: (data: PersonalInfo) => void;
    jobDescription?: string;
}

export default function PersonalInfoForm({ data, onChange, jobDescription }: Props) {
    const { user } = useAuth();
    const [isImproving, setIsImproving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [improvedText, setImprovedText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const handleImproveSummary = async () => {
        const currentSummary = data.summary?.trim();
        if (!currentSummary || currentSummary.length < 10) {
            setError("Please write at least a few words before enhancing.");
            return;
        }

        setError(null);
        setIsImproving(true);
        setModalOpen(true); // Open modal early to show loading state
        setImprovedText("");

        try {
            const token = await user?.getIdToken() || "";
            const improved = await improveSection("summary", currentSummary, token, jobDescription);
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
            onChange({ ...data, summary: finalText });
        }
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setImprovedText("");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add your contact details and a brief summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={data.fullName} onChange={handleChange} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={data.email} onChange={handleChange} placeholder="e.g. john@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={data.phone} onChange={handleChange} placeholder="e.g. +1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={data.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                    <Input id="portfolioUrl" name="portfolioUrl" type="url" value={data.portfolioUrl} onChange={handleChange} placeholder="e.g. https://johndoe.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                    <Input id="linkedinUrl" name="linkedinUrl" type="url" value={data.linkedinUrl} onChange={handleChange} placeholder="e.g. https://linkedin.com/in/johndoe" />
                </div>
            </div>

            <div className="space-y-2 relative">
                <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleImproveSummary}
                        disabled={isImproving}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 transition-colors"
                    >
                        <Sparkles className={`w-4 h-4 mr-1.5 ${isImproving ? "animate-pulse" : ""}`} />
                        {isImproving ? "Enhancing..." : "Improve with AI"}
                    </Button>
                </div>

                {error && (
                    <div className="text-xs text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 p-2 rounded-md mb-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {error}
                    </div>
                )}

                <textarea
                    id="summary"
                    name="summary"
                    value={data.summary}
                    onChange={handleChange}
                    rows={4}
                    className="w-full flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-400 transition-colors"
                    placeholder="Results-driven Software Engineer with 5+ years of experience..."
                />
                <p className="text-[11px] text-slate-500">Briefly introduce yourself, key skills, and career focus.</p>
            </div>

            <AIImprovementModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onAccept={handleAcceptImprovement}
                onRegenerate={() => handleImproveSummary()}
                originalText={data.summary || ""}
                improvedText={improvedText}
                isImproving={isImproving}
                isJdActive={!!jobDescription}
            />
        </div>
    );
}
