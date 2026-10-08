import React from "react";
import { Briefcase, Building2, Search, FileText } from "lucide-react";

interface JobDetailsSectionProps {
  jobTitle: string;
  onJobTitleChange: (val: string) => void;
  companyName: string;
  onCompanyNameChange: (val: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  onLoadFromJobSearch: () => void;
}

export default function JobDetailsSection({
  jobTitle,
  onJobTitleChange,
  companyName,
  onCompanyNameChange,
  jobDescription,
  onJobDescriptionChange,
  onLoadFromJobSearch,
}: JobDetailsSectionProps) {
  const charCount = jobDescription.length;
  const maxChars = 2000;

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
            1
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Job Details
          </h2>
        </div>

        <button
          type="button"
          onClick={onLoadFromJobSearch}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Load from Job Search</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>Job Title *</span>
          </label>
          <input
            type="text"
            required
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Company Name *</span>
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="e.g. Razorpay, Stripe, Google"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Job Description</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {charCount} / {maxChars}
          </span>
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value.slice(0, maxChars))}
          rows={4}
          placeholder="Paste key responsibilities or full job description for precise keyword matching..."
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
        />
      </div>
    </div>
  );
}
