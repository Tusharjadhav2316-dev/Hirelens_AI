"use client";

import { Trash2, Sparkles, FileSpreadsheet } from "lucide-react";
import { SAMPLE_JOB_DESCRIPTIONS } from "./SampleJDs";

interface JobDescriptionCardProps {
  jobDescription: string;
  onChange: (value: string) => void;
  onClear: () => void;
  maxLength?: number;
}

export default function JobDescriptionCard({
  jobDescription,
  onChange,
  onClear,
  maxLength = 5000,
}: JobDescriptionCardProps) {
  const charCount = jobDescription.length;

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_JOB_DESCRIPTIONS.find((s) => s.id === sampleId);
    if (sample) {
      onChange(sample.description);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Job Description</h2>
        </div>

        {charCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
            title="Clear job description"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative flex-1 flex flex-col min-h-[140px]">
        <textarea
          value={jobDescription}
          onChange={(e) => onChange(e.target.value.substring(0, maxLength))}
          placeholder="Paste target job description to calculate match score, missing keywords, and role-specific suggestions..."
          className="w-full flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar transition-all"
        />

        {/* Character Count */}
        <div className="flex justify-end mt-1.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
          </span>
        </div>
      </div>

      {/* Sample Job Descriptions Chips */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sample Roles:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_JOB_DESCRIPTIONS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
