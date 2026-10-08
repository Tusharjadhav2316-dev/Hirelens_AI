import React, { useState } from "react";
import { Sliders, X, Plus, Sparkles, Target, Clock, HelpCircle } from "lucide-react";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type QuestionCountOption = 3 | 5 | 8;
export type TimePerQuestionOption = 2 | 3 | 5;

interface InterviewSettingsCardProps {
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (diff: DifficultyLevel) => void;
  questionCount: QuestionCountOption;
  onQuestionCountChange: (count: QuestionCountOption) => void;
  timePerQuestion: TimePerQuestionOption;
  onTimePerQuestionChange: (time: TimePerQuestionOption) => void;
  focusTopics: string[];
  onAddFocusTopic: (topic: string) => void;
  onRemoveFocusTopic: (topic: string) => void;
}

export default function InterviewSettingsCard({
  targetRole,
  onTargetRoleChange,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  timePerQuestion,
  onTimePerQuestionChange,
  focusTopics,
  onAddFocusTopic,
  onRemoveFocusTopic,
}: InterviewSettingsCardProps) {
  const [newTopicInput, setNewTopicInput] = useState("");

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTopicInput.trim();
    if (!clean) return;
    if (!focusTopics.includes(clean)) {
      onAddFocusTopic(clean);
    }
    setNewTopicInput("");
  };

  return (
    <div className="p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Sliders className="w-4 h-4 text-indigo-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Settings & Focus Areas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Target Role Input (4 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Target Role *</span>
          </label>
          <input
            type="text"
            required
            value={targetRole}
            onChange={(e) => onTargetRoleChange(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {/* Difficulty Select (3 cols) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
          >
            <option value="beginner">Beginner / Entry Level</option>
            <option value="intermediate">Intermediate / Mid-Senior</option>
            <option value="advanced">Advanced / Lead Architect</option>
          </select>
        </div>

        {/* Questions Count Select (2 cols) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Questions</span>
          </label>
          <select
            value={questionCount}
            onChange={(e) => onQuestionCountChange(Number(e.target.value) as QuestionCountOption)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
          >
            <option value={3}>3 (Quick ~10m)</option>
            <option value={5}>5 (Standard ~15m)</option>
            <option value={8}>8 (Deep Dive ~25m)</option>
          </select>
        </div>

        {/* Time Per Question Select (3 cols) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Time / Question</span>
          </label>
          <select
            value={timePerQuestion}
            onChange={(e) => onTimePerQuestionChange(Number(e.target.value) as TimePerQuestionOption)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
          >
            <option value={2}>2 Minutes (Concise)</option>
            <option value={3}>3 Minutes (Standard)</option>
            <option value={5}>5 Minutes (In-depth)</option>
          </select>
        </div>
      </div>

      {/* Focus Topics Section */}
      <div className="pt-2 space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Focus Competencies & Keywords
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {focusTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => onRemoveFocusTopic(topic)}
                className="hover:text-rose-600 transition cursor-pointer"
                aria-label={`Remove ${topic}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Add custom topic form */}
          <form onSubmit={handleAddTopic} className="inline-flex items-center gap-1.5">
            <input
              type="text"
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              placeholder="+ Add focus topic"
              className="w-36 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {newTopicInput.trim() && (
              <button
                type="submit"
                className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
