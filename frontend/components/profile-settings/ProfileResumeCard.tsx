import React, { useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, ChevronRight, Plus } from "lucide-react";
import { ResumeVersionItem } from "@/components/resume-history/HistoryTypes";

interface ProfileResumeCardProps {
  resumes: ResumeVersionItem[];
  defaultResumeId?: string;
  onSelectDefaultResume: (id: string) => void;
}

export default function ProfileResumeCard({
  resumes = [],
  defaultResumeId,
  onSelectDefaultResume,
}: ProfileResumeCardProps) {
  const [isChanging, setIsChanging] = useState(false);

  const activeResume =
    resumes.find((r) => r.id === defaultResumeId) || resumes[0] || null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Resume & Documents
          </h3>
        </div>

        {resumes.length > 1 && !isChanging && (
          <button
            type="button"
            onClick={() => setIsChanging(true)}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline cursor-pointer"
          >
            Change Default
          </button>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No resumes saved yet. Build your first resume to link it as default.
          </p>
          <Link
            href="/dashboard/builder"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Resume</span>
          </Link>
        </div>
      ) : isChanging ? (
        <div className="space-y-2 animate-in fade-in duration-150">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select which resume should be set as your primary default:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {resumes.map((resume) => {
              const isSelected = (defaultResumeId || resumes[0]?.id) === resume.id;
              return (
                <div
                  key={resume.id}
                  onClick={() => {
                    onSelectDefaultResume(resume.id);
                    setIsChanging(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600"
                      : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {resume.title}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {resume.template} Template • ATS {resume.atsScore}%
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setIsChanging(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-1 block"
          >
            Cancel
          </button>
        </div>
      ) : (
        activeResume && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 mb-1">
                  Default
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeResume.title}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {activeResume.roleTitle || "Target Role Draft"} • {activeResume.updatedAt}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/dashboard/builder"
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 group"
              >
                <span>Open in Builder</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard/history"
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                View History
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
