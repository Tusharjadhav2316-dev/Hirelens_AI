import React from "react";
import { Bookmark, ArrowRight, Building2, Trash2 } from "lucide-react";
import { JobListing } from "./JobTypes";

interface SavedJobsCardProps {
  savedJobs: JobListing[];
  onRemoveSaved: (jobId: string) => void;
  onJobClick?: (job: JobListing) => void;
}

export default function SavedJobsCard({
  savedJobs,
  onRemoveSaved,
  onJobClick,
}: SavedJobsCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
            <Bookmark className="w-4 h-4 fill-amber-500/30" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved Jobs</h3>
            <p className="text-[11px] text-slate-400">
              {savedJobs.length} {savedJobs.length === 1 ? "position" : "positions"} bookmarked
            </p>
          </div>
        </div>

        {savedJobs.length > 0 && (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer">
            View All <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {savedJobs.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Bookmark className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            No saved jobs yet
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] mx-auto">
            Click the bookmark icon on any job card to save it for quick review.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div
                onClick={() => onJobClick && onJobClick(job)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${job.companyColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                >
                  {job.companyInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {job.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {job.salaryRange}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRemoveSaved(job.id)}
                aria-label="Remove saved job"
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
