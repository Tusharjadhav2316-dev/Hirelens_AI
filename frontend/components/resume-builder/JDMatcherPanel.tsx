"use client";

import { useState, useRef } from "react";
import { Resume } from "@/types/resume";
import { analyzeJobMatch, JobMatchResult, formatResumeToText } from "@/lib/jdMatcher";
import { CheckCircle2, Loader2, Sparkles, AlertTriangle, AlertCircle, FileText, UploadCloud, ChevronDown, ChevronUp } from "lucide-react";
import { saveActivityHistory, getHistoryItem } from "@/lib/historyService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface JDMatcherPanelProps {
    resume: Resume;
}

export default function JDMatcherPanel({ resume }: JDMatcherPanelProps) {
    const { user } = useAuth();
    const [jobDescription, setJobDescription] = useState("");
    const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [isRefining, setIsRefining] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Dual Source State
    const [sourceMode, setSourceMode] = useState<"builder" | "pdf">("builder");

    // Rehydration from History
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!user) return;
        const historyId = searchParams.get("historyId");
        if (!historyId) return;

        getHistoryItem(user.uid, historyId).then(item => {
            if (item && item.type === "job-match" && item.contentSnapshot) {
                // To display the score we have to set the snapshot text into the PDF source
                // So that 'targetTextToAnalyze' matches it, and we can force an "Analyze" render 
                // But without JD, re-analzying is impossible. 
                // However, we just need the text to be visible so the user can paste JD and run again.
                setSourceMode("pdf");
                setPdfText(item.contentSnapshot);
                toast.success("Loaded previous match snapshot. Paste Job Description to re-analyze.");
            }
        }).catch(console.error);
    }, [user]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfText, setPdfText] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keyword Overflow Expand State
    const [showAllMissing, setShowAllMissing] = useState(false);
    const [showAllMatched, setShowAllMatched] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setPdfFile(file);
        setMatchResult(null);
        setAiInsights(null);

        if (file.type !== "application/pdf") {
            setUploadError("Only PDF files are allowed.");
            setPdfFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be under 5MB.");
            setPdfFile(null);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/parse-pdf", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = "Failed to parse PDF";
                try {
                    const data = await res.json();
                    errorMessage = data.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${res.status} ${res.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            setPdfText(data.extractedText);
        } catch (error) {
            console.error("PDF upload error:", error);
            setUploadError(error instanceof Error ? error.message : "Error reading PDF file.");
            setPdfFile(null);
            setPdfText(null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleAnalyze = () => {
        if (!jobDescription.trim()) return;

        let targetTextToAnalyze = "";
        if (sourceMode === "builder") {
            targetTextToAnalyze = formatResumeToText(resume);
        } else {
            if (!pdfText) {
                setUploadError("Please wait for your PDF to finish processing or try uploading again.");
                return;
            }
            targetTextToAnalyze = pdfText;
        }

        setIsAnalyzing(true);
        setTimeout(async () => {
            const result = analyzeJobMatch(targetTextToAnalyze, jobDescription);
            setMatchResult(result);
            setAiInsights(null);
            setAiError(null);
            setShowAllMissing(false);
            setShowAllMatched(false);
            setIsAnalyzing(false);

            if (user) {
                await saveActivityHistory(
                    user.uid,
                    "job-match",
                    resume.title ? `Match for ${resume.title}` : "Resume Match",
                    { score: result.matchScore },
                    targetTextToAnalyze
                );
            }
        }, 300);
    };

    const handleGetAiInsights = async () => {
        if (!jobDescription.trim() || !matchResult) return;

        setIsRefining(true);
        setAiError(null);

        let targetTextToAnalyze = "";
        if (sourceMode === "builder") {
            targetTextToAnalyze = `
Skills: ${resume.skills.map(s => `${s.name} - ${s.level}`).join(', ')}
Experience: ${resume.experience.map(e => `${e.position} at ${e.company}: ${e.description}`).join(' | ')}
Projects: ${resume.projects.map(p => `${p.name} (${(p.technologies || []).join(', ')}): ${p.description}`).join(' | ')}
Summary: ${resume.personalInfo.summary}
`;
        } else {
            targetTextToAnalyze = pdfText || "";
        }

        try {
            const response = await fetch("/api/jd-refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText: targetTextToAnalyze, jobDescription }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to get AI insights";
                try {
                    const data = await response.json();
                    errorMessage = data.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setAiInsights(data.refinedInsights);
        } catch (error) {
            console.error("AI Insights error:", error);
            setAiError(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setIsRefining(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500 stroke-emerald-500";
        if (score >= 60) return "text-amber-500 stroke-amber-500";
        return "text-red-500 stroke-red-500";
    };

    const getAlertUI = (score: number) => {
        if (score >= 80) {
            return (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex gap-3 items-start w-full">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm text-emerald-300">Strong alignment with job requirements.</p>
                        <p className="text-sm text-emerald-500/80 mt-1">Your resume is highly optimized for this role.</p>
                    </div>
                </div>
            );
        }
        if (score >= 60) {
            return (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-4 flex gap-3 items-start w-full">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm text-amber-300">Your resume partially matches this role.</p>
                        <p className="text-sm text-amber-500/80 mt-1">Consider adding more of the missing keywords below.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex gap-3 items-start w-full">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-sm text-red-300">Your resume has low alignment with this job.</p>
                    <p className="text-sm text-red-500/80 mt-1">Significant updates are needed to pass ATS systems.</p>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Left Column: Input and Triggers */}
            <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full rounded-2xl p-6 shadow-md dark:shadow-xl">

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Resume Source</h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setSourceMode("builder")}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sourceMode === "builder" ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm border border-slate-200 dark:border-transparent" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}
                        >
                            Use Current Resume
                        </button>
                        <button
                            onClick={() => setSourceMode("pdf")}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${sourceMode === "pdf" ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm border border-slate-200 dark:border-transparent" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}
                        >
                            <UploadCloud className="w-4 h-4" />
                            Upload Resume PDF
                        </button>
                    </div>
                </div>

                {sourceMode === "pdf" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Upload PDF</h3>
                        <label className={`flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer transition-colors ${pdfFile ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500"}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-slate-400">Processing PDF...</p>
                                    </>
                                ) : pdfFile && pdfText ? (
                                    <>
                                        <div className="bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2 text-gray-800 dark:text-slate-300 border border-slate-200 dark:border-transparent shadow-sm">
                                            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                            <span className="font-medium text-gray-900 dark:text-slate-200">{pdfFile.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">Click to replace PDF</p>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-3" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">PDF (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                        {uploadError && <p className="text-sm text-red-400 mt-1">{uploadError}</p>}
                    </div>
                )}

                <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Job Description</h3>

                {sourceMode === "builder" ? (
                    <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400 flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        Analyzing your currently edited resume in the Builder.
                    </div>
                ) : (
                    <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-400 flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 shrink-0" />
                        Analyzing your uploaded PDF resume.
                    </div>
                )}

                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job requirements here..."
                    className="w-full h-64 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none font-mono text-sm shadow-inner"
                />

                <div className="flex gap-4 pt-2">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !jobDescription.trim() || (sourceMode === "pdf" && !pdfText)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-xl py-3 transition shadow-sm dark:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                    </button>
                    {matchResult && (
                        <button
                            onClick={handleGetAiInsights}
                            disabled={isRefining}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap"
                        >
                            {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isRefining ? "Refining..." : "Get AI Insights"}
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column: Results Dashboard */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full rounded-2xl shadow-md dark:shadow-xl sticky top-6 min-h-[500px]">
                {!matchResult ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-gray-500 dark:text-slate-400">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                            <Sparkles className="w-8 h-8 text-gray-400 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-300">Ready to Analyze</h3>
                        <p className="text-sm max-w-sm">
                            Paste a job description on the left and click "Analyze Match" to instantly see how well your resume aligns.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 p-6 pb-4">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-semibold text-slate-100 mb-6 w-full text-left">Alignment Score</h3>
                            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="72"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-100 dark:text-slate-800"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="72"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={452.389}
                                        strokeDashoffset={452.389 - (452.389 * matchResult.matchScore) / 100}
                                        className={`${getScoreColor(matchResult.matchScore).split(' ')[1]} transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-bold ${getScoreColor(matchResult.matchScore).split(' ')[0]}`}>
                                            {matchResult.matchScore}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">/100</span>
                                    </div>
                                </div>
                            </div>

                            {getAlertUI(matchResult.matchScore)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide border-b border-gray-200 dark:border-slate-800 pb-2">Section Breakdown</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: "Skills Identity", score: matchResult.sectionMatch.skills },
                                        { label: "Experience Match", score: matchResult.sectionMatch.experience },
                                        { label: "Projects Match", score: matchResult.sectionMatch.projects }
                                    ].map((stat) => (
                                        <div key={stat.label}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-medium text-gray-600 dark:text-slate-400">{stat.label}</span>
                                                <span className="font-bold text-gray-900 dark:text-slate-300">{stat.score}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${stat.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {matchResult.missingKeywords.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide border-b border-gray-200 dark:border-slate-800 pb-2 mb-3 flex items-center gap-2">
                                            Missing Keywords
                                            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium border border-gray-200 dark:border-transparent">{matchResult.missingKeywords.length}</span>
                                        </h4>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 py-1">
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.missingKeywords.map(kw => (
                                                    <span key={kw} className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-3 py-1 text-xs font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {matchResult.matchedKeywords.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide border-b border-gray-200 dark:border-slate-800 pb-2 mb-3 flex items-center gap-2">
                                            Matched Keywords
                                            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium border border-gray-200 dark:border-transparent">{matchResult.matchedKeywords.length}</span>
                                        </h4>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 py-1">
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.matchedKeywords.map(kw => (
                                                    <span key={kw} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Insights display area */}
                        {aiError && (
                            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="font-medium">{aiError}</p>
                            </div>
                        )}

                        {aiInsights && (
                            <div className="mt-8 overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 shadow-sm animate-in zoom-in-95 duration-300">
                                <div className="bg-purple-100/50 dark:bg-purple-900/30 px-6 py-4 flex items-center justify-between border-b border-purple-100 dark:border-purple-800/30">
                                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        Deep Alignment Analysis
                                    </h4>
                                </div>
                                <div className="p-6">
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
