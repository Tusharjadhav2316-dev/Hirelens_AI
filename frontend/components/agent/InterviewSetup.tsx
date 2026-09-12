"use client";

import React, { useState } from "react";
import { Sparkles, Layers, Award, ListOrdered, Briefcase, X } from "lucide-react";

export interface InterviewConfig {
  interviewType: "mixed" | "technical" | "behavioral" | "hr";
  difficulty: "beginner" | "intermediate" | "advanced";
  count: number;
  targetRole: string;
}

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
  onCancel?: () => void;
  initialRole?: string;
}

export default function InterviewSetup({
  onStart,
  onCancel,
  initialRole = "Software Engineer",
}: InterviewSetupProps) {
  const [interviewType, setInterviewType] = useState<"mixed" | "technical" | "behavioral" | "hr">("mixed");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [count, setCount] = useState<number>(5);
  const [targetRole, setTargetRole] = useState<string>(initialRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      interviewType,
      difficulty,
      count,
      targetRole: targetRole.trim() || "Software Engineer",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-md space-y-6 max-w-xl mx-auto">
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mock Interview Setup
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your AI interview session parameters and target role.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cancel setup"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Target Role */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            Target Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Backend Engineer"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Interview Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Interview Mode
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "mixed", label: "Mixed", desc: "Technical & Behavioral" },
              { id: "technical", label: "Technical", desc: "Architecture & Code" },
              { id: "behavioral", label: "Behavioral", desc: "STAR & Leadership" },
              { id: "hr", label: "HR Screening", desc: "Fit & Expectations" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setInterviewType(mode.id as any)}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  interviewType === mode.id
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {mode.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            Starting Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id as any)}
                className={`py-2 px-3 text-center text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  difficulty === diff.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
            Session Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { count: 3, label: "3 Questions" },
              { count: 5, label: "5 Questions" },
              { count: 10, label: "10 Questions" },
            ].map((item) => (
              <button
                key={item.count}
                type="button"
                onClick={() => setCount(item.count)}
                className={`py-2 px-3 text-center text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  count === item.count
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Interview
          </button>
        </div>
      </form>
    </div>
  );
}
