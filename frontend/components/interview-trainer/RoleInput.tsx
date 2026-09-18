"use client";

import React from "react";
import { Briefcase, FileText, Info } from "lucide-react";

interface RoleInputProps {
  role: string;
  onRoleChange: (val: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  error?: string;
}

export default function RoleInput({
  role,
  onRoleChange,
  jobDescription,
  onJobDescriptionChange,
  error,
}: RoleInputProps) {
  return (
    <div className="space-y-6">
      {/* Target Role Input */}
      <div>
        <label
          htmlFor="targetRole"
          className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5"
        >
          Target Role <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          Type any role or title (e.g. <em>Senior Marketing Manager</em>, <em>High School Biology Teacher</em>, <em>Product Lead</em>). The system decomposes this dynamically with zero role bias.
        </p>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <input
            id="targetRole"
            type="text"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            placeholder="e.g. Senior Marketing Manager"
            className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-slate-200 dark:border-slate-800 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
            }`}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {error}
          </p>
        )}
      </div>

      {/* Optional Job Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="jobDescription"
            className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            Target Job Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
          </label>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Improves accuracy
          </span>
        </div>
        <div className="relative rounded-xl shadow-sm">
          <textarea
            id="jobDescription"
            rows={4}
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste target job description or requirements here..."
            className="block w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all resize-y text-sm"
          />
        </div>

        <div className="mt-2.5 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            {jobDescription.trim().length > 20 ? (
              <span><strong>Grounding Active:</strong> Interview questions & competencies will be tailored strictly to the requirements in this Job Description.</span>
            ) : (
              <span><strong>Inference Mode:</strong> When no Job Description is provided, the trainer will infer standard industry competencies and state its transparent assumptions.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
