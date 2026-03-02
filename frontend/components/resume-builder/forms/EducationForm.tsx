import { Education } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
    data: Education[];
    onChange: (data: Education[]) => void;
}

export default function EducationForm({ data, onChange }: Props) {
    const handleAdd = () => {
        onChange([
            ...data,
            { id: Date.now().toString(), institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter((item) => item.id !== id));
    };

    const handleChange = (id: string, field: keyof Education, value: string) => {
        onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add your educational background.</p>
                </div>
                <Button onClick={handleAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Education
                </Button>
            </div>

            <div className="space-y-6">
                {data.map((item, index) => (
                    <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 ease-in-out">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-slate-900 dark:text-white">Education {index + 1}</h4>
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Institution Name</Label>
                                <Input value={item.institution} onChange={(e) => handleChange(item.id, "institution", e.target.value)} placeholder="e.g. Stanford University" />
                            </div>
                            <div className="space-y-2">
                                <Label>Degree</Label>
                                <Input value={item.degree} onChange={(e) => handleChange(item.id, "degree", e.target.value)} placeholder="e.g. Bachelor of Science" />
                            </div>
                            <div className="space-y-2">
                                <Label>Field of Study</Label>
                                <Input value={item.fieldOfStudy} onChange={(e) => handleChange(item.id, "fieldOfStudy", e.target.value)} placeholder="e.g. Computer Science" />
                            </div>
                            <div className="space-y-2">
                                <Label>GPA (Optional)</Label>
                                <Input value={item.gpa || ""} onChange={(e) => handleChange(item.id, "gpa", e.target.value)} placeholder="e.g. 3.8/4.0" />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input value={item.startDate} onChange={(e) => handleChange(item.id, "startDate", e.target.value)} placeholder="e.g. Sep 2018" />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input value={item.endDate} onChange={(e) => handleChange(item.id, "endDate", e.target.value)} placeholder="e.g. May 2022" />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300">
                        No education added yet. Click &quot;Add Education&quot; to begin.
                    </div>
                )}
            </div>
        </div>
    );
}
