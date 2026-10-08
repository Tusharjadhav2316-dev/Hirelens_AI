import React, { useState, useRef, useEffect } from "react";
import {
  Star,
  MoreVertical,
  Edit3,
  Copy,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import ScoreRing from "@/components/common/ScoreRing";
import { ResumeVersionItem } from "./HistoryTypes";

interface ResumeVersionCardProps {
  version: ResumeVersionItem;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onEdit: (version: ResumeVersionItem) => void;
  onDuplicate: (version: ResumeVersionItem) => void;
  onDownload: (version: ResumeVersionItem) => void;
  onDelete: (id: string) => void;
}

export default function ResumeVersionCard({
  version,
  isSelected,
  onSelect,
  onToggleStar,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
}: ResumeVersionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left group ${
        isSelected
          ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-100 dark:ring-blue-950"
          : "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
      }`}
    >
      {/* Top Row: Star, Title & Context Menu */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Star Button */}
          <button
            type="button"
            onClick={(e) => onToggleStar(version.id, e)}
            className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
              version.isStarred
                ? "text-amber-500 hover:text-amber-600"
                : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
            }`}
            title={version.isStarred ? "Remove star" : "Star resume"}
          >
            <Star className={`w-4 h-4 ${version.isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>

          <div className="min-w-0 flex-1">
            <h3
              className={`text-sm sm:text-base font-bold truncate ${
                isSelected
                  ? "text-blue-950 dark:text-white font-bold"
                  : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              }`}
            >
              {version.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{version.updatedAt}</span>
              {version.roleTitle && (
                <>
                  <span>•</span>
                  <span className="truncate">{version.roleTitle}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: ScoreRing & Context Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreRing score={version.atsScore} size="sm" />

          {/* Context Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Resume options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(version);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Edit in Builder</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(version);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate Version</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDownload(version);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download PDF</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-750 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(version.id);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Version</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Tags (Template + ATS status) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-750 capitalize">
          {version.template} Template
        </span>
        {version.isAtsOptimized && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-violet-500" />
            <span>ATS Optimized</span>
          </span>
        )}
        {version.isCustomTemplate && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
            Custom
          </span>
        )}
      </div>

      {/* Bottom Row: Skill Chips */}
      {version.skills && version.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          {version.skills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-750"
            >
              {skill}
            </span>
          ))}
          {version.skills.length > 4 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium self-center">
              +{version.skills.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
