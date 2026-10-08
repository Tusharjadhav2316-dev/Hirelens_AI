import React, { useRef } from "react";
import {
  Edit3,
  Download,
  FileText,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ResumePreview from "@/components/resume-builder/preview/ResumePreview";
import { ResumeVersionItem } from "./HistoryTypes";

interface ResumeHistoryPreviewPanelProps {
  selectedVersion: ResumeVersionItem | null;
  onEdit: (version: ResumeVersionItem) => void;
  onDownloadPdf?: (version: ResumeVersionItem) => void;
}

export default function ResumeHistoryPreviewPanel({
  selectedVersion,
  onEdit,
}: ResumeHistoryPreviewPanelProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  // Client-side Print / PDF export
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedVersion
      ? `${selectedVersion.title.replace(/\s+/g, "_")}_HireLens`
      : "Resume_HireLens",
  });

  if (!selectedVersion) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
        <FileText className="w-12 h-12 mb-3 stroke-1 text-slate-300 dark:text-slate-600" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
          No Resume Selected
        </h3>
        <p className="text-xs max-w-xs">
          Select a resume version from the list on the left to preview its formatted layout and export PDF.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* 1. Preview Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {selectedVersion.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 capitalize">
              {selectedVersion.template}
            </span>
            {selectedVersion.isAtsOptimized && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                ATS {selectedVersion.atsScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedVersion.roleTitle || "Target Role Draft"} • {selectedVersion.updatedAt}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(selectedVersion)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
            <span>Edit in Builder</span>
          </button>

          <button
            onClick={() => handlePrint()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Document Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-100/60 dark:bg-slate-950/70 flex justify-center min-h-[620px]">
        {/* Printable/Export Component Container (Strict pure white document paper) */}
        <div
          ref={printRef}
          className="w-full max-w-[780px] bg-white text-slate-900 shadow-lg rounded-sm border border-slate-200/90 overflow-hidden transition-all duration-300 my-auto"
          style={{ minHeight: "900px" }}
        >
          <ResumePreview resume={selectedVersion.resumeData} />
        </div>
      </div>
    </div>
  );
}
