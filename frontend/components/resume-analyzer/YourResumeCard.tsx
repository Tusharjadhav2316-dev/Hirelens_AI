"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, X, Loader2, Sparkles } from "lucide-react";
import { Resume } from "@/types/resume";

interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
}

interface YourResumeCardProps {
  fileInfo: UploadedFileInfo | null;
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  onPreviewResume?: () => void;
  onUseCurrentResume?: () => void;
  hasCurrentResume?: boolean;
}

export default function YourResumeCard({
  fileInfo,
  isProcessing,
  onFileUpload,
  onRemoveFile,
  onPreviewResume,
  onUseCurrentResume,
  hasCurrentResume = false,
}: YourResumeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Resume</h2>
        </div>
        {fileInfo && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {fileInfo ? (
          /* File Uploaded State */
          <div className="relative p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-slate-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={fileInfo.name}>
                  {fileInfo.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatFileSize(fileInfo.size)} • {fileInfo.type.toUpperCase() || "DOCUMENT"}
                </p>
              </div>
            </div>

            {/* Action Buttons: Preview & Remove */}
            <div className="flex items-center gap-1 shrink-0">
              {onPreviewResume && (
                <button
                  type="button"
                  onClick={onPreviewResume}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                  title="Preview resume document"
                >
                  <span>Preview</span>
                </button>
              )}
              <button
                type="button"
                onClick={onRemoveFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Remove resume"
                aria-label="Remove resume"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone State */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-800/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={handleFileSelect}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extracting content...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  PDF, DOCX, or TXT (up to 5MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick option to use builder resume */}
        {!fileInfo && hasCurrentResume && onUseCurrentResume && (
          <button
            type="button"
            onClick={onUseCurrentResume}
            className="mt-2.5 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use current Builder resume</span>
          </button>
        )}
      </div>
    </div>
  );
}
