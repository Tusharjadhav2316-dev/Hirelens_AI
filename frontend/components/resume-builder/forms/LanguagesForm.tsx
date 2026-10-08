"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe } from "lucide-react";

interface Props {
    languages?: string[];
    onChange: (languages: string[]) => void;
}

export default function LanguagesForm({ languages = [], onChange }: Props) {
    const [newLang, setNewLang] = useState("");

    const handleAdd = () => {
        if (!newLang.trim()) return;
        if (!languages.includes(newLang.trim())) {
            onChange([...languages, newLang.trim()]);
        }
        setNewLang("");
    };

    const handleRemove = (index: number) => {
        const updated = languages.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Languages
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add languages you speak and your proficiency level.
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder="e.g. English (Fluent), Spanish (Conversational)"
                    className="text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <Button onClick={handleAdd} size="sm" className="rounded-xl px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </div>

            <div className="space-y-2 mt-3">
                {languages.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No languages added yet. Add languages above.
                    </div>
                ) : (
                    languages.map((lang, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{lang}</span>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
