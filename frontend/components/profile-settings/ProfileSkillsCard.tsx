import React, { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ProfileSkillsCardProps {
  skills: string[];
  onChangeSkills: (skills: string[]) => void;
}

export default function ProfileSkillsCard({
  skills = [],
  onChangeSkills,
}: ProfileSkillsCardProps) {
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in your skills list.`);
      return;
    }

    const updated = [...skills, trimmed];
    onChangeSkills(updated);
    setNewSkill("");
    setIsAdding(false);
    toast.success(`Added "${trimmed}" to skills`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    onChangeSkills(updated);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Skills ({skills.length})
          </h3>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {/* Add Skill Input Form */}
      {isAdding && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-violet-300 dark:border-violet-700/80 animate-in fade-in duration-150">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill name and press Enter..."
            autoFocus
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white transition cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewSkill("");
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Skill Tags */}
      {skills.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          No skills added yet. Click "+ Add Skill" above to add your competencies.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-750 group hover:border-violet-300 dark:hover:border-violet-700 transition"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                title={`Remove ${skill}`}
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
