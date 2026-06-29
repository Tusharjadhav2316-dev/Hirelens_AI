"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { generateCoverLetter, processCoverLetterAction } from "@/lib/coverLetterEngine";
import { Sparkles, UploadCloud, FileText, Wand2, RefreshCcw, RefreshCw, Download, Copy, FileIcon, Settings2, Trash2, Zap, Scissors } from "lucide-react";
import { saveActivityHistory, getHistoryItem } from "@/lib/historyService";
import { useAuth } from "@/contexts/AuthContext";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PdfEditableViewer = dynamic(() => import("@/components/pdf/PdfEditableViewer"), { ssr: false });

export default function CoverLetterPage() {
    const { user } = useAuth();
    // Top Input State
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [tone, setTone] = useState("Professional");
    const [inputMode, setInputMode] = useState<"Resume" | "Custom">("Resume");
    const [customInput, setCustomInput] = useState("");

    // Resume State (for generating from Resume)
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Generation State
    const [coverLetterText, setCoverLetterText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI Action State
    const [actionLoading, setActionLoading] = useState<"improve" | "shorten" | "impactful" | null>(null);

    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rehydration from History
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!user) return;
        const historyId = searchParams.get("historyId");
        if (!historyId) return;

        getHistoryItem(user.uid, historyId).then(item => {
            if (item && item.type === "cover-letter" && item.contentSnapshot) {
                setCoverLetterText(item.contentSnapshot);
                if (item.metadata?.jobTitle) setJobTitle(item.metadata.jobTitle);
                if (item.metadata?.company) setCompanyName(item.metadata.company);
                toast.success("Loaded cover letter from history");
            }
        }).catch(console.error);
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please upload a valid PDF file.");
            return;
        }

        setPdfFile(file);
        setIsUploading(true);
        // PdfEditableViewer will mount implicitly below and extract text
        setTimeout(() => setIsUploading(false), 800);
    };

    const handleGenerate = async () => {
        if (!jobTitle || !companyName) {
            setError("Job title and company name are required.");
            return;
        }

        if (inputMode === "Resume" && !resumeText) {
            setError("Upload a resume first.");
            return;
        }
        if (inputMode === "Custom" && !customInput) {
            setError("Custom input is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await generateCoverLetter({
                resumeText: inputMode === "Resume" ? resumeText : undefined,
                customInput: inputMode === "Custom" ? customInput : undefined,
                jobTitle,
                companyName,
                jobDescription,
                tone
            });
            setCoverLetterText(result);

            if (user) {
                saveActivityHistory(
                    user.uid,
                    "cover-letter",
                    `Cover Letter — ${companyName}`,
                    { company: companyName, jobTitle: jobTitle },
                    result
                ).catch(console.error);
            }
        } catch (err: any) {
            setError(err.message || "Failed to generate cover letter.");
        } finally {
            setLoading(false);
        }
    };

    const handleAiAction = async (action: "improve" | "shorten" | "impactful") => {
        // Grab the latest text from the editor exactly as it is seen
        const currentText = editorRef.current?.innerText || coverLetterText;
        if (!currentText) return;

        setActionLoading(action);
        setError(null);
        try {
            const result = await processCoverLetterAction({ currentText, action });
            setCoverLetterText(result);
            // Updating the DOM node manually to stay in sync if it's currently focused
            if (editorRef.current) {
                editorRef.current.innerText = result;
            }
        } catch (err: any) {
            setError(err.message || `Failed to ${action} cover letter.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleExportWord = async () => {
        const currentText = editorRef.current?.innerText || coverLetterText;
        if (!currentText) return;

        const paragraphs = currentText.split("\n\n").map(para => new Paragraph({
            children: [new TextRun({ text: para, font: "Arial", size: 24 })],
            spacing: { after: 200 }
        }));

        const doc = new Document({
            sections: [{ properties: {}, children: paragraphs }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Cover_Letter_${companyName.replace(/\\s+/g, '_')}.docx`);
    };

    const handleExportPdf = async () => {
        const currentText = editorRef.current?.innerText || coverLetterText;
        if (!currentText) return;

        try {
            const pdfDoc = await PDFDocument.create();
            let page = pdfDoc.addPage();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const fontSize = 11;
            const lineHeight = 1.3;
            const margin = 50;
            const { width, height } = page.getSize();
            let y = height - margin;

            const paragraphs = currentText.split("\n\n");

            for (const para of paragraphs) {
                const words = para.split(" ");
                let line = "";
                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + " ";
                    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                    if (testWidth > width - margin * 2 && i > 0) {
                        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
                        line = words[i] + " ";
                        y -= fontSize * lineHeight;
                        if (y < margin) {
                            page = pdfDoc.addPage();
                            y = height - margin;
                        }
                    } else {
                        line = testLine;
                    }
                }

                page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
                y -= fontSize * lineHeight * 2; // Extra spacing for paragraphs
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            saveAs(blob, `Cover_Letter_${companyName.replace(/\\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF Export error:", err);
            setError("Failed to export PDF.");
        }
    };

    const handleCopyToClipboard = () => {
        const currentText = editorRef.current?.innerText || coverLetterText;
        if (currentText) {
            navigator.clipboard.writeText(currentText);
            // could add an ephemeral toast here
            alert("Copied to clipboard!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        Cover Letter Generator
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                            <Sparkles className="w-3 h-3" />
                            AI Powered
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        Create a perfectly tailored cover letter using your resume and target job description.
                    </p>
                </div>
            </div>

            {/* STEP 1: Top Input Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 flex rounded-lg text-sm items-center gap-2">
                            <Settings2 className="w-4 h-4 shrink-0" /> <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Role *</label>
                            <input
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Google, Stripe"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tone</label>
                            <select
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="Professional and Confident">Professional & Confident</option>
                                <option value="Enthusiastic and Passionate">Enthusiastic</option>
                                <option value="Direct and Minimal">Direct & Minimal</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Source</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setInputMode("Resume")}
                                    className={`flex-1 flex justify-center py-1.5 text-xs font-bold rounded-md transition-all ${inputMode === "Resume" ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500'}`}
                                >
                                    From PDF Resume
                                </button>
                                <button
                                    onClick={() => setInputMode("Custom")}
                                    className={`flex-1 flex justify-center py-1.5 text-xs font-bold rounded-md transition-all ${inputMode === "Custom" ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Custom Input
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Job Description (Optional but Highly Recommended)</label>
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description so the AI can tailor keywords and phrases..."
                            className="w-full h-24 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Source Data Inputs */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                        {inputMode === "Resume" ? (
                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Base Resume Material</h4>
                                {!pdfFile ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Upload PDF Resume</span>
                                        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                                        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                                            <FileText className="w-5 h-5" />
                                            {isUploading || !resumeText ? "Extracting..." : "Resume Extracted Successfully"}
                                        </div>
                                        <button onClick={() => { setPdfFile(null); setResumeText(""); }} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {/* Invisible parser for the upload */}
                                <div className="hidden">
                                    {pdfFile && <PdfEditableViewer file={pdfFile} onTextUpdate={setResumeText} />}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Custom Details (Skills, Exp, Achievements)</label>
                                <textarea
                                    value={customInput}
                                    onChange={e => setCustomInput(e.target.value)}
                                    placeholder="I have 5 years of React experience... I spearheaded a migration..."
                                    className="w-full h-32 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !jobTitle || !companyName || (inputMode === "Resume" && !resumeText) || (inputMode === "Custom" && !customInput)}
                        className="bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 min-w-[160px]"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {loading ? "Generating..." : "Generate Draft"}
                    </button>
                </div>
            </div>

            {/* STEP 3 & 4: Live Editable Preview & Bottom Actions */}
            {coverLetterText && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">

                    {/* Action Buttons Centered Above Editor */}
                    <div className="flex items-center justify-center gap-3 flex-wrap max-w-[800px] mx-auto w-full mt-4">
                        <button onClick={() => handleAiAction("improve")} disabled={actionLoading !== null} className="px-4 py-2 bg-purple-100 text-purple-700 font-bold text-sm rounded-md flex items-center gap-2 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 disabled:opacity-50">
                            {actionLoading === "improve" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Polish
                        </button>
                        <button onClick={() => handleAiAction("shorten")} disabled={actionLoading !== null} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold text-sm rounded-md flex items-center gap-2 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 disabled:opacity-50">
                            {actionLoading === "shorten" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />} Shorten
                        </button>
                        <button onClick={() => handleAiAction("impactful")} disabled={actionLoading !== null} className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-sm rounded-md flex items-center gap-2 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 disabled:opacity-50">
                            {actionLoading === "impactful" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} + Impact
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 min-h-[1123px] max-w-[800px] w-full mx-auto shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg p-10 md:p-14 mb-8 text-gray-900 dark:text-white relative group">

                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            className="w-full h-full outline-none whitespace-pre-wrap text-sm leading-relaxed"
                            style={{ fontFamily: 'Times New Roman, serif' }} // classic cover letter look
                        >
                            {coverLetterText}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button onClick={handleExportPdf} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                            <FileIcon className="w-4 h-4" /> Export PDF
                        </button>
                        <button onClick={handleExportWord} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold text-sm rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <FileIcon className="w-4 h-4" /> Export Word
                        </button>
                        <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Copy className="w-4 h-4" /> Copy Text
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
