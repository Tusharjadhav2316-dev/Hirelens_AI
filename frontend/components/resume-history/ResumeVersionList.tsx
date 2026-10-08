import React from "react";
import Link from "next/link";
import { FileText, Plus, SearchX, RotateCcw } from "lucide-react";
import { ResumeVersionItem } from "./HistoryTypes";
import ResumeVersionCard from "./ResumeVersionCard";

interface ResumeVersionListProps {
  versions: ResumeVersionItem[];
  selectedVersionId: string | null;
  onSelectVersion: (version: ResumeVersionItem) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onEdit: (version: ResumeVersionItem) => void;
  onDuplicate: (version: ResumeVersionItem) => void;
  onDownload: (version: ResumeVersionItem) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export default function ResumeVersionList({
  versions,
  selectedVersionId,
  onSelectVersion,
  onToggleStar,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
  onClearFilters,
  isFiltered,
}: ResumeVersionListProps) {
  if (versions.length === 0) {
    if (isFiltered) {
      return (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No matching resumes found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
            Try adjusting your search terms or filter selections to find what you're looking for.
          </p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      );
    }

    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
          No resume history yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
          Resumes and drafts you save in the Resume Builder will automatically appear here with version tracking and ATS scores.
        </p>
        <Link
          href="/dashboard/builder"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Your First Resume</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 overflow-y-auto custom-scrollbar max-h-[780px] pr-1">
      {versions.map((v) => (
        <ResumeVersionCard
          key={v.id}
          version={v}
          isSelected={v.id === selectedVersionId}
          onSelect={() => onSelectVersion(v)}
          onToggleStar={onToggleStar}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
