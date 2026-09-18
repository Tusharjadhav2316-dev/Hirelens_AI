"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, Layers, Compass } from "lucide-react";

export type InterviewType = "technical" | "behavioral" | "hr" | "mixed";
export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";
export type TrainingMode = "coaching" | "realistic_mock";

interface InterviewConfigFormProps {
  interviewType: InterviewType;
  onTypeChange: (val: InterviewType) => void;
  difficulty: InterviewDifficulty;
  onDifficultyChange: (val: InterviewDifficulty) => void;
  trainingMode: TrainingMode;
  onModeChange: (val: TrainingMode) => void;
}

const interviewTypes: { id: InterviewType; label: string; desc: string }[] = [
  { id: "mixed", label: "Comprehensive (Mixed)", desc: "Balanced mix of technical, behavioral, and situational scenarios." },
  { id: "behavioral", label: "Behavioral (STAR)", desc: "Past experience, leadership, teamwork, and situational conflict." },
  { id: "technical", label: "Technical & Domain", desc: "Deep technical, architectural, or domain-specific problem solving." },
  { id: "hr", label: "HR & Cultural Fit", desc: "Career trajectory, motivation, cultural alignment, and expectations." },
];

const difficulties: { id: InterviewDifficulty; label: string; badge: string }[] = [
  { id: "beginner", label: "Foundational / Junior", badge: "Beginner" },
  { id: "intermediate", label: "Standard / Mid-Level", badge: "Intermediate" },
  { id: "advanced", label: "Advanced / Principal", badge: "Advanced" },
];

export default function InterviewConfigForm({
  interviewType,
  onTypeChange,
  difficulty,
  onDifficultyChange,
  trainingMode,
  onModeChange,
}: InterviewConfigFormProps) {
  return (
    <div className="space-y-6">
      {/* Training Mode Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Training Experience Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Coaching Mode Card */}
          <button
            type="button"
            onClick={() => onModeChange("coaching")}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              trainingMode === "coaching"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500 ring-2 ring-blue-600/20 shadow-sm"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className={`p-1.5 rounded-lg ${trainingMode === "coaching" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Interactive Coaching Mode
              </span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive live feedback, structural coaching, and retry opportunities after each answer to refine your delivery in real-time.
            </p>
          </button>

          {/* Realistic Mock Card */}
          <button
            type="button"
            onClick={() => onModeChange("realistic_mock")}
            className={`p-4 rounded-xl border text-left transition-all ${
              trainingMode === "realistic_mock"
                ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-500 ring-2 ring-purple-600/20 shadow-sm"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className={`p-1.5 rounded-lg ${trainingMode === "realistic_mock" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Realistic Mock Exam
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Simulates a formal, uninterrupted live interview without intermediate hints. Comprehensive feedback is delivered in your final report.
            </p>
          </button>
        </div>
      </div>

      {/* Interview Focus Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Interview Category & Focus
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {interviewTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onTypeChange(type.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                interviewType === type.id
                  ? "border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-500 ring-1 ring-blue-500"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="font-medium text-xs text-slate-900 dark:text-slate-100 mb-0.5">
                {type.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {type.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Target Seniority / Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              type="button"
              onClick={() => onDifficultyChange(diff.id)}
              className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                difficulty === diff.id
                  ? "border-blue-600 bg-blue-600 text-white font-semibold shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-xs"
              }`}
            >
              <span className="text-xs">{diff.badge}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
