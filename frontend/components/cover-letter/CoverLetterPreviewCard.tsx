import React, { useRef } from "react";
import {
  FileText,
  Sparkles,
  Scissors,
  Zap,
  Edit3,
  RefreshCw,
  Copy,
  Download,
  FileIcon,
  Check,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import {
  CoverLetterTemplateId,
  COVER_LETTER_TEMPLATES,
} from "./CoverLetterTypes";

interface CoverLetterPreviewCardProps {
  coverLetterText: string;
  onCoverLetterTextChange: (newText: string) => void;
  templateId: CoverLetterTemplateId;
  onTemplateChange: (t: CoverLetterTemplateId) => void;
  candidateName: string;
  candidateTitle: string;
  candidateEmail?: string;
  candidatePhone?: string;
  companyName: string;
  jobTitle: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onRegenerate: () => void;
  onAiAction: (action: "improve" | "shorten" | "impactful") => void;
  aiActionLoading: "improve" | "shorten" | "impactful" | null;
  onCopy: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
  isGenerating: boolean;
}

export default function CoverLetterPreviewCard({
  coverLetterText,
  onCoverLetterTextChange,
  templateId,
  onTemplateChange,
  candidateName,
  candidateTitle,
  candidateEmail,
  candidatePhone,
  companyName,
  jobTitle,
  isEditing,
  onToggleEdit,
  onRegenerate,
  onAiAction,
  aiActionLoading,
  onCopy,
  onExportPdf,
  onExportWord,
  isGenerating,
}: CoverLetterPreviewCardProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const currentTemplate = COVER_LETTER_TEMPLATES.find((t) => t.id === templateId) || COVER_LETTER_TEMPLATES[0];

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Cover Letter Preview</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Formatted print-ready document preview
          </p>
        </div>

        {/* Template Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Template:</span>
          <div className="relative">
            <select
              value={templateId}
              onChange={(e) => onTemplateChange(e.target.value as CoverLetterTemplateId)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pr-7 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {COVER_LETTER_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* AI Quick Refinement Bar (Visible when letter exists) */}
      {coverLetterText && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pl-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Polish:</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAiAction("improve")}
              disabled={aiActionLoading !== null}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 transition cursor-pointer disabled:opacity-50"
            >
              {aiActionLoading === "improve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Polish</span>
            </button>

            <button
              type="button"
              onClick={() => onAiAction("shorten")}
              disabled={aiActionLoading !== null}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 transition cursor-pointer disabled:opacity-50"
            >
              {aiActionLoading === "shorten" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scissors className="w-3 h-3" />}
              <span>Shorten</span>
            </button>

            <button
              type="button"
              onClick={() => onAiAction("impactful")}
              disabled={aiActionLoading !== null}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 transition cursor-pointer disabled:opacity-50"
            >
              {aiActionLoading === "impactful" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              <span>+ Impact</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Document Paper Sheet */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-950/70 p-3 sm:p-6 rounded-xl border border-slate-200/70 dark:border-slate-800/80 flex justify-center items-start min-h-[520px] overflow-y-auto">
        {!coverLetterText ? (
          <div className="my-auto py-16 text-center space-y-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto shadow-xs">
              <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Your cover letter will appear here
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Fill in the job details on the left and click &quot;Generate Cover Letter&quot; to produce a tailored draft.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`w-full max-w-[650px] bg-white text-slate-900 shadow-md border border-slate-200/90 rounded-xl p-6 sm:p-10 transition-all ${
              templateId === "modern"
                ? "border-t-4 border-t-indigo-600"
                : templateId === "creative"
                ? "border-t-4 border-t-purple-600"
                : ""
            }`}
          >
            {/* Header section on document paper */}
            <div className="border-b border-slate-200 pb-4 mb-6 space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {candidateName || "Candidate Name"}
              </h3>
              <p className="text-xs font-semibold text-indigo-700">
                {candidateTitle || jobTitle || "Professional"}
              </p>
              {(candidateEmail || candidatePhone) && (
                <p className="text-[11px] text-slate-500 pt-0.5">
                  {[candidateEmail, candidatePhone].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>

            {/* Date & Employer Block */}
            <div className="space-y-1 mb-6 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">{currentDate}</p>
              <p className="font-bold text-slate-900 pt-1">Hiring Team</p>
              <p className="font-semibold text-slate-700">{companyName || "Target Company"}</p>
              <p className="text-slate-500">Re: Application for {jobTitle || "Open Role"}</p>
            </div>

            {/* Document Body */}
            {isEditing ? (
              <textarea
                value={coverLetterText}
                onChange={(e) => onCoverLetterTextChange(e.target.value)}
                rows={16}
                className="w-full p-3 text-xs sm:text-sm font-serif leading-relaxed text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            ) : (
              <div
                ref={editorRef}
                className={`text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap space-y-3 ${
                  templateId === "professional" ? "font-serif" : "font-sans"
                }`}
              >
                {coverLetterText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      {coverLetterText && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleEdit}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isEditing
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80"
              }`}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Save Edits" : "Edit Content"}</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={onExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
            >
              <FileIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>DOCX</span>
            </button>

            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs active:scale-[0.98] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
