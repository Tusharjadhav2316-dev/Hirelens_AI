import { Achievement } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
    data: Achievement[];
    onChange: (data: Achievement[]) => void;
}

export default function AchievementsForm({ data, onChange }: Props) {
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

                        <div className="space-y-2">
                            <Label>Description</Label>
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
        </div>
    );
}
