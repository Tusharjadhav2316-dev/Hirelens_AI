import { Certification } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
    data: Certification[];
    onChange: (data: Certification[]) => void;
}

export default function CertificationsForm({ data, onChange }: Props) {
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
                                <Label>Certification Name</Label>
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
        </div>
    );
}
