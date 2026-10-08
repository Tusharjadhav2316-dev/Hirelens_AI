import React, { useRef } from "react";
import { FileText, UploadCloud, CheckCircle2, Trash2, Loader2, Sparkles } from "lucide-react";

interface YourContentSectionProps {
  sourceMode: "builder" | "pdf" | "custom";
  onSourceModeChange: (mode: "builder" | "pdf" | "custom") => void;
  resumeFileName?: string;
  pdfFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPdf: () => void;
  isUploading: boolean;
  resumeText: string;
  customInput: string;
  onCustomInputChange: (val: string) => void;
}

export default function YourContentSection({
  sourceMode,
  onSourceModeChange,
  resumeFileName,
  pdfFile,
  onFileChange,
  onClearPdf,
  isUploading,
  resumeText,
  customInput,
  onCustomInputChange,
}: YourContentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
            2
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Your Content
          </h2>
        </div>

        {/* Source Mode Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => onSourceModeChange("builder")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              sourceMode === "builder"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Builder Resume
          </button>
          <button
            type="button"
            onClick={() => onSourceModeChange("pdf")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              sourceMode === "pdf"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => onSourceModeChange("custom")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              sourceMode === "custom"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Custom Text
          </button>
        </div>
      </div>

      {sourceMode === "builder" && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {resumeFileName || "Active Builder Resume"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Auto-syncing skills, work experience, and achievements
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            ✓ Ready
          </span>
        </div>
      )}

      {sourceMode === "pdf" && (
        <div className="space-y-3">
          {!pdfFile ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50/30 dark:hover:bg-slate-900 rounded-xl cursor-pointer transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-7 h-7 text-indigo-500 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Click to upload resume PDF or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF format, max 5MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {pdfFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isUploading ? (
                      <span className="flex items-center gap-1 text-indigo-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> Extracting resume text...
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Extracted & Ready
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearPdf}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {sourceMode === "custom" && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Candidate Background Summary
          </label>
          <textarea
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            rows={4}
            placeholder="Outline your background, key achievements, years of experience, and primary stack..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
          />
        </div>
      )}
    </div>
  );
}
