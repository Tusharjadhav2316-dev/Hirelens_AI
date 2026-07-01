"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { analyzeResumeQuality, analyzeResumeMatch, ATSResult } from "@/lib/atsEngine";

const PdfEditableViewer = dynamic(() => import("@/components/pdf/PdfEditableViewer"), { ssr: false });
import { Sparkles, UploadCloud, AlertTriangle, CheckCircle2, Edit3, Wand2, RefreshCcw, Activity, Target } from "lucide-react";
import { saveActivityHistory, getHistoryItem } from "@/lib/historyService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function ResumeAnalyzerPage() {
    const { user } = useAuth();
    // PDF State
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active Engine State
    const [scoringMode, setScoringMode] = useState<"Quality" | "Match">("Quality");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [atsResult, setAtsResult] = useState<ATSResult | null>(null);

    // UX State
    const [showEditor, setShowEditor] = useState(false);

    // AI Insights State
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Rehydration from History
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!user) return;
        const historyId = searchParams.get("historyId");
        if (!historyId) return;

        getHistoryItem(user.uid, historyId).then(item => {
            if (item && item.type === "ats-analysis" && item.contentSnapshot) {
                setResumeText(item.contentSnapshot);
                // Force to Quality mode since we didn't save JD
                setScoringMode("Quality");
                setAtsResult(analyzeResumeQuality(item.contentSnapshot));
                toast.success("Loaded analysis from history");
            }
        }).catch(console.error);
    }, [user]);

    // Live Engine Recalculation Handlers
    const handleTextUpdate = (parsedText: string) => {
        setResumeText(parsedText);
        // Immediately trigger calculation on extraction/update
        if (!parsedText) {
            setAtsResult(null);
            return;
        }
        if (scoringMode === "Quality") {
            setAtsResult(analyzeResumeQuality(parsedText));
        } else {
            setAtsResult(analyzeResumeMatch(parsedText, jobDescription));
        }
    };

    const handleJdChange = (val: string) => {
        setJobDescription(val);
        if (scoringMode === "Match" && resumeText) {
            setAtsResult(analyzeResumeMatch(resumeText, val));
        }
    };

    const handleModeChange = (mode: "Quality" | "Match") => {
        setScoringMode(mode);
        setAiInsights(null);
        if (mode === "Quality") {
            if (resumeText) setAtsResult(analyzeResumeQuality(resumeText));
        } else {
            if (resumeText) setAtsResult(analyzeResumeMatch(resumeText, jobDescription));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setUploadError("Please upload a valid PDF file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be less than 5MB.");
            return;
        }

        setUploadError(null);
        setPdfFile(file);
        setIsUploading(true);
        // PdfEditableViewer will mount implicitly below and extract text
        setTimeout(() => setIsUploading(false), 800);
    };

    const handleGetInsights = async () => {
        if (!resumeText) return;
        setIsAiLoading(true);
        setAiError(null);
        setAiInsights(null);

        try {
            const token = await user?.getIdToken() || "";
            const res = await fetch("/api/ai-insights", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    resumeText,
                    jobDescription: scoringMode === "Match" ? jobDescription : null,
                    atsBreakdown: atsResult?.breakdown,
                    mode: scoringMode
                })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch AI Insights");
            }
            if (!data.insights) {
                throw new Error("AI returned empty insights.");
            }

            setAiInsights(data.insights);

            if (user && atsResult) {
                saveActivityHistory(
                    user.uid,
                    "ats-analysis",
                    scoringMode === "Quality" ? "ATS Quality Score" : "JD Match Score",
                    { score: atsResult.finalScore },
                    resumeText
                ).catch(console.error);
            }
        } catch (err: any) {
            console.error(err);
            setAiError(err.message || "Failed to fetch insights. Please try again.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleStartOver = () => {
        setPdfFile(null);
        setResumeText("");
        setAtsResult(null);
        setShowEditor(false);
        setJobDescription("");
        setAiInsights(null);
        setAiError(null);
        setScoringMode("Quality");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500 stroke-emerald-500 scale-100";
        if (score >= 60) return "text-amber-500 stroke-amber-500 scale-100";
        return "text-red-500 stroke-red-500 scale-100";
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8 flex flex-col items-start gap-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    Resume Analyzer
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        AI & ATS Powered
                    </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Upload your resume, verify its baseline formatting quality, or switch to JD Match mode to compare it against a specific job posting.
                </p>
            </div>

            <div className="flex flex-col gap-6 w-full">

                {/* STEP 1: Upload - Only visible when NO PDF is uploaded */}
                {!pdfFile && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
                            <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-200">1. Upload Resume (PDF Only)</h2>
                            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${pdfFile ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <>
                                            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Processing Document...</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                                            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
                                            <p className="text-sm text-slate-500 mt-1">PDF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                            </label>
                            {uploadError && <p className="text-sm text-red-500 mt-4 font-bold p-3 bg-red-50 dark:bg-red-900/20 rounded-md">{uploadError}</p>}
                        </div>
                    </div>
                )}

                {/* HIDDEN INVISIBLE PARSER - Always in the DOM when PDF exists to drive extraction */}

                {pdfFile && (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
                        {/* Mode Toggle */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm gap-4">
                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl inline-flex shadow-inner">
                                <button
                                    onClick={() => handleModeChange("Quality")}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${scoringMode === 'Quality' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    <Activity className="w-4 h-4" /> Resume Quality
                                </button>
                                <button
                                    onClick={() => handleModeChange("Match")}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${scoringMode === 'Match' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    <Target className="w-4 h-4" /> Match With Job
                                </button>
                            </div>
                            <button onClick={handleStartOver} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap px-4 border-l border-slate-200 dark:border-slate-700">
                                <RefreshCcw className="w-4 h-4" /> Start Over
                            </button>
                        </div>

                        {/* Match Mode JD Imput */}
                        {scoringMode === "Match" && (
                            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 p-5 rounded-xl shadow-sm relative overflow-hidden">
                                <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></span>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 pl-2">Target Job Description</h3>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => handleJdChange(e.target.value)}
                                    placeholder="Paste the target job description here to calculate a Match Score..."
                                    className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        )}

                        <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full rounded-2xl shadow-sm">
                            {isUploading || !atsResult ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 space-y-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Extracting Text...</h3>
                                </div>
                            ) : scoringMode === "Match" && (!jobDescription || atsResult?.finalScore === 0) ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 space-y-4">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                        <Target className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Awaiting Job Description</h3>
                                    <p className="text-sm text-slate-500 max-w-sm">
                                        Paste a Job Description above to calculate how well your resume matches the requirements.
                                    </p>
                                </div>
                            ) : atsResult && (
                                <div className="p-6 md:p-8 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">

                                    {/* Top Row: ATS Logic vs AI Insights */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                        {/* Left: ATS Score & Breakdown */}
                                        <div className="flex flex-col gap-6">
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                                                {scoringMode === "Quality" ? "Resume Quality Score" : "ATS Match Score"}
                                            </h3>

                                            <div className="flex items-center gap-6">
                                                {/* Score Circle */}
                                                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                                        <circle
                                                            cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                            strokeDasharray={351.8}
                                                            strokeDashoffset={351.8 - (351.8 * atsResult.finalScore) / 100}
                                                            className={`${getScoreColor(atsResult.finalScore)} transition-all duration-1000 ease-out`}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute flex flex-col items-center justify-center">
                                                        <span className={`text-4xl font-black ${getScoreColor(atsResult.finalScore).split(' ')[0]}`}>
                                                            {atsResult.finalScore}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">/ 100</span>
                                                    </div>
                                                </div>

                                                {/* Detailed Bars */}
                                                <div className="space-y-4 w-full">
                                                    {atsResult.breakdown.map((stat) => (
                                                        <div key={stat.label}>
                                                            <div className="flex justify-between text-xs mb-1.5 items-center">
                                                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                                                    {stat.label} <span className="text-slate-400">({stat.weight})</span>
                                                                </span>
                                                                <span className="font-semibold text-slate-800 dark:text-white">{stat.score}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.score >= 80 ? 'bg-emerald-500' : stat.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${stat.score}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: AI Insights */}
                                        <div className="flex flex-col gap-4 h-full">
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
                                                AI Insights
                                                <button
                                                    onClick={handleGetInsights}
                                                    disabled={isAiLoading || !resumeText}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-md font-semibold transition-all disabled:opacity-50 text-xs"
                                                >
                                                    {isAiLoading ? <div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                    {isAiLoading ? "Analyzing..." : "Generate Insights"}
                                                </button>
                                            </h3>

                                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col justify-center min-h-[160px]">
                                                {!aiInsights && !aiError && !isAiLoading && (
                                                    <div className="text-center space-y-2">
                                                        <Wand2 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                                                        <p className="text-xs text-slate-500">Click Generate Insights to get AI-powered feedback customized for your {scoringMode} score.</p>
                                                    </div>
                                                )}

                                                {isAiLoading && (
                                                    <div className="text-center space-y-3">
                                                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 animate-pulse">Running advanced heuristics...</p>
                                                    </div>
                                                )}

                                                {aiError && !isAiLoading && (
                                                    <div className="text-center space-y-2">
                                                        <AlertTriangle className="w-5 h-5 text-red-400 mx-auto" />
                                                        <p className="text-xs text-red-500 font-medium">{aiError}</p>
                                                    </div>
                                                )}

                                                {aiInsights && !isAiLoading && (
                                                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                                        {aiInsights}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Improvement Flags List */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Rule-Based Flags</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {atsResult.flags.missingKeywords.length > 0 && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-blue-500" />
                                                    <div>
                                                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-0.5">Missing Keywords</p>
                                                        <p className="text-blue-700 dark:text-blue-400/80">Add: {atsResult.flags.missingKeywords.join(", ")}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {atsResult.flags.noQuantification && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                                                    <div>
                                                        <p className="font-semibold text-amber-900 dark:text-amber-300 mb-0.5">Missing Metrics</p>
                                                        <p className="text-amber-700 dark:text-amber-400/80">Swap vague descriptions for numbers (%, $).</p>
                                                    </div>
                                                </div>
                                            )}
                                            {atsResult.flags.weakVerbs.length > 0 && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                                    <div>
                                                        <p className="font-semibold text-red-900 dark:text-red-300 mb-0.5">Passive Verbs</p>
                                                        <p className="text-red-700 dark:text-red-400/80">Replace: {atsResult.flags.weakVerbs.slice(0, 5).join(", ")}{atsResult.flags.weakVerbs.length > 5 ? '...' : ''}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {atsResult.flags.lowWordCount && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                                    <div>
                                                        <p className="font-semibold text-red-900 dark:text-red-300 mb-0.5">Too Short</p>
                                                        <p className="text-red-700 dark:text-red-400/80">Resume text is under 500 characters.</p>
                                                    </div>
                                                </div>
                                            )}
                                            {atsResult.flags.experienceGap && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                                                    <div>
                                                        <p className="font-semibold text-amber-900 dark:text-amber-300 mb-0.5">Experience Gap</p>
                                                        <p className="text-amber-700 dark:text-amber-400/80">JD requires more years than detected.</p>
                                                    </div>
                                                </div>
                                            )}
                                            {atsResult.flags.missingEducation && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                                    <div>
                                                        <p className="font-semibold text-red-900 dark:text-red-300 mb-0.5">Missing Education</p>
                                                        <p className="text-red-700 dark:text-red-400/80">{scoringMode === 'Match' ? 'JD asks for specific degree keywords.' : 'No education formatting detected.'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {(!atsResult.flags.noQuantification && atsResult.flags.weakVerbs.length === 0 && atsResult.flags.missingKeywords.length === 0 && !atsResult.flags.lowWordCount && !atsResult.flags.missingEducation && !atsResult.flags.experienceGap) && (
                                                <div className="flex gap-2.5 text-xs p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 lg:col-span-2">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                                                    <div>
                                                        <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-0.5">Looking Excellent</p>
                                                        <p className="text-emerald-700 dark:text-emerald-400/80">No major formatting penalties detected. Your engine score is mathematically optimal based on rules.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* Editor Toggle & Panel (Always in DOM for extraction) */}
                        <div className="w-full flex flex-col items-end">
                            <button
                                onClick={() => setShowEditor(!showEditor)}
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm z-10 ${showEditor ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border border-transparent' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {showEditor ? "Hide Editor" : "Edit Resume Manually"}
                            </button>

                            <div className={`transition-all duration-300 origin-top w-full ${showEditor ? "block opacity-100 scale-y-100 h-auto mt-4" : "opacity-0 scale-y-0 h-0 overflow-hidden"}`}>
                                <div className="w-full bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-inner">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Edit3 className="w-4 h-4 text-blue-500" /> Live Resume Source
                                        </h3>
                                    </div>
                                    <PdfEditableViewer file={pdfFile} onTextUpdate={handleTextUpdate} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
