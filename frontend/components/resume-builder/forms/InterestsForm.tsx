"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Heart } from "lucide-react";

interface Props {
    interests?: string[];
    onChange: (interests: string[]) => void;
}

export default function InterestsForm({ interests = [], onChange }: Props) {
    const [newInterest, setNewInterest] = useState("");

    const handleAdd = () => {
        if (!newInterest.trim()) return;
        if (!interests.includes(newInterest.trim())) {
            onChange([...interests, newInterest.trim()]);
        }
        setNewInterest("");
    };

    const handleRemove = (index: number) => {
        const updated = interests.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Interests & Hobbies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add personal interests, sports, or creative hobbies that reflect your personality.
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder="e.g. Open Source, Cloud Architecture, Chess, Marathon"
                    className="text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <Button onClick={handleAdd} size="sm" className="rounded-xl px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </div>

            <div className="space-y-2 mt-3">
                {interests.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No interests added yet. Add interests above.
                    </div>
                ) : (
                    interests.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item}</span>
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
