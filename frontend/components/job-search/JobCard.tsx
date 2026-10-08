import React from "react";
import { Bookmark, MapPin, Building2, Sparkles, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { JobListing } from "./JobTypes";
import ScoreRing from "@/components/common/ScoreRing";

interface JobCardProps {
  job: JobListing;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onApplyClick: (job: JobListing) => void;
}

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  onApplyClick,
}: JobCardProps) {
  return (
    <div className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 shadow-xs hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left + Middle Content */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company Monogram */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.companyColor} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}
          >
            {job.companyInitials}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {/* Title + Best Match badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              {job.isBestMatch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Best Match
                </span>
              )}
            </div>

            {/* Company & Meta info */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location} ({job.workMode})
              </span>
              <span>•</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                {job.salaryRange}
              </span>
            </div>

            {/* Description excerpt */}
            {job.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                {job.description}
              </p>
            )}

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Footer timestamp & job type */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {job.postedDate}
              </span>
              <span>•</span>
              <span>{job.jobType}</span>
              <span>•</span>
              <span>{job.experienceLevel}</span>
            </div>
          </div>
        </div>

        {/* Right Match Ring & Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <ScoreRing
              score={job.matchScore}
              size="sm"
              showPercent={true}
              className="scale-95"
            />
            <button
              onClick={() => onToggleSave(job.id)}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isSaved
                  ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-500"
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-400" : ""}`} />
            </button>
          </div>

          <button
            onClick={() => onApplyClick(job)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <span>Quick Apply</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
