import { Skill } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
    data: Skill[];
    onChange: (data: Skill[]) => void;
}

export default function SkillsForm({ data, onChange }: Props) {
    const handleAdd = () => {
        onChange([
            ...data,
            { id: Date.now().toString(), name: "", level: "Intermediate" }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter((item) => item.id !== id));
    };

    const handleChange = (id: string, field: keyof Skill, value: string) => {
        onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add your technical and soft skills.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Skill
                </Button>
            </div>

            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.id} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out">
                        <div className="flex-1 space-y-2">
                            <Label className="sr-only">Skill Name</Label>
                            <Input
                                value={item.name}
                                onChange={(e) => handleChange(item.id, "name", e.target.value)}
                                placeholder="e.g. React, Python, Project Management"
                            />
                        </div>
                        <div className="w-40 space-y-2">
                            <Label className="sr-only">Proficiency Level</Label>
                            <select
                                value={item.level}
                                onChange={(e) => handleChange(item.id, "level", e.target.value as Skill["level"])}
                                className="w-full flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-blue-600 transition-colors"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-2 mb-1 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300">
                        No skills added yet. Click &quot;Add Skill&quot; to begin.
                    </div>
                )}
            </div>
        </div>
    );
}
