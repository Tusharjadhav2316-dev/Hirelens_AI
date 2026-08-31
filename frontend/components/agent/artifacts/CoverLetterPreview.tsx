"use client";

import React, { useState } from "react";
import { CoverLetterArtifactData } from "@/types/agent";
import { Mail, Copy, Check, Edit3, Save, X, Download, Building, Briefcase } from "lucide-react";

interface CoverLetterPreviewProps {
    data: CoverLetterArtifactData;
}

export default function CoverLetterPreview({ data }: CoverLetterPreviewProps) {
    const [content, setContent] = useState<string>(data?.content || "");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editContent, setEditContent] = useState<string>(data?.content || "");
    const [copied, setCopied] = useState<boolean>(false);

    if (!data || (!data.content && !content)) return null;

    const currentText = content || data.content || "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy cover letter text:", err);
        }
    };

    const handleStartEdit = () => {
        setEditContent(currentText);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        setContent(editContent);
        setIsEditing(false);
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Cover Letter - ${data.jobTitle || "Application"}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; font-size: 13px; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
    .title { font-size: 18px; font-weight: bold; color: #0f172a; }
    .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .content { white-space: pre-wrap; font-size: 13px; color: #334155; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Cover Letter</div>
    ${(data.jobTitle || data.companyName) ? `<div class="sub">Position: ${data.jobTitle || "Software Engineer"} ${data.companyName ? `at ${data.companyName}` : ""}</div>` : ""}
  </div>
  <div class="content">${currentText}</div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Tailored Cover Letter Workspace
                        </h3>
                        {(data.jobTitle || data.companyName) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                {data.jobTitle && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400" /> {data.jobTitle}</span>}
                                {data.companyName && <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-400" /> {data.companyName}</span>}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={handleStartEdit}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </button>

                            <button
                                onClick={handleCopy}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400">✓ Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition-colors shadow-xs"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                            </button>

                            <button
                                onClick={handleSaveEdit}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors shadow-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Document Workspace Content */}
            {!isEditing ? (
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                    {currentText}
                </div>
            ) : (
                <textarea
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
            )}
        </div>
    );
}
