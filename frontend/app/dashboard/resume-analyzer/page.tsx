"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import { toast } from "sonner";
import {
  FileSearch,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2,
  Wand2,
  Eye,
  FileText,
} from "lucide-react";

import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";
import YourResumeCard from "@/components/resume-analyzer/YourResumeCard";
import JobDescriptionCard from "@/components/resume-analyzer/JobDescriptionCard";
import TipsCard from "@/components/resume-analyzer/TipsCard";
import ATSScoreCard from "@/components/resume-analyzer/ATSScoreCard";
import KeywordAnalysisCard from "@/components/resume-analyzer/KeywordAnalysisCard";
import ResumePreviewModal from "@/components/resume-analyzer/ResumePreviewModal";
import InsightsCard from "@/components/resume-analyzer/InsightsCard";
import HistoryDrawer from "@/components/resume-analyzer/HistoryDrawer";
import AIImprovementModal from "@/components/resume-builder/AIImprovementModal";
import { SAMPLE_JOB_DESCRIPTIONS } from "@/components/resume-analyzer/SampleJDs";

import { analyzeResumeQuality, analyzeResumeMatch, ATSResult } from "@/lib/atsEngine";
import { computeKeywordBreakdown, extractCanonicalKeywords } from "@/lib/keywordExtractor";
import { saveActivityHistory, getHistoryItem, ActivityHistoryItem } from "@/lib/historyService";
import { formatResumeToText } from "@/lib/jdMatcher";
import { improveSection } from "@/lib/aiService";

function ResumeAnalyzerContent() {
  const { user } = useAuth();
  const { resume } = useResume();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Input states
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analysis result states
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

  // UI Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [isImproving, setIsImproving] = useState(false);

  // Rehydration from URL query historyId
  useEffect(() => {
    if (!user) return;
    const historyId = searchParams.get("historyId");
    if (!historyId) return;

    getHistoryItem(user.uid, historyId)
      .then((item) => {
        if (item && item.type === "ats-analysis" && item.contentSnapshot) {
          handleLoadHistoryItem(item);
        }
      })
      .catch(console.error);
  }, [user, searchParams]);

  // Load history item into state
  const handleLoadHistoryItem = (item: ActivityHistoryItem) => {
    if (!item.contentSnapshot) return;
    setResumeText(item.contentSnapshot);
    setFileInfo({
      name: item.title || "Resume Snapshot",
      size: item.contentSnapshot.length,
      type: "Snapshot",
    });

    const result = analyzeResumeQuality(item.contentSnapshot);
    setAtsResult(result);
    
    const breakdown = computeKeywordBreakdown(item.contentSnapshot, jobDescription);
    setMatchedKeywords(breakdown.matched);
    setMissingKeywords(breakdown.missing);
    setSuggestedKeywords(breakdown.suggested);
    
    toast.success("Loaded analysis from history.");
  };

  // Handle file upload & backend parsing
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setIsProcessingFile(true);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.name.split(".").pop() || "doc",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = (await user?.getIdToken()) || "";
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume document.");
      }

      const extractedText = data.text || "";
      if (!extractedText.trim()) {
        throw new Error("Could not extract legible text from file.");
      }

      setResumeText(extractedText);
      toast.success(`Parsed "${file.name}" successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to parse resume file.");
      setFileInfo(null);
      setResumeText("");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Use current resume from ResumeContext
  const handleUseCurrentResume = () => {
    const formatted = formatResumeToText(resume);
    if (!formatted.trim()) {
      toast.error("Builder resume is currently empty.");
      return;
    }
    const name = `${resume.personalInfo.fullName || "Current"}_Resume.pdf`;
    setFileInfo({
      name,
      size: formatted.length * 2,
      type: "Builder",
    });
    setResumeText(formatted);
    toast.success("Loaded current resume from Resume Builder.");
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setFileInfo(null);
    setResumeText("");
    setAtsResult(null);
    setMatchedKeywords([]);
    setMissingKeywords([]);
    setSuggestedKeywords([]);
  };

  // Run ATS Analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please upload or provide a resume to analyze.");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Small debounce delay for polished animation feel
      await new Promise((resolve) => setTimeout(resolve, 500));

      let result: ATSResult;
      const isMatchMode = jobDescription.trim().length >= 20;

      if (isMatchMode) {
        result = analyzeResumeMatch(resumeText, jobDescription);
      } else {
        result = analyzeResumeQuality(resumeText);
      }

      setAtsResult(result);

      // Extract canonical, clean, deduplicated keywords
      const breakdown = computeKeywordBreakdown(resumeText, jobDescription);
      setMatchedKeywords(breakdown.matched);
      setMissingKeywords(breakdown.missing);
      setSuggestedKeywords(breakdown.suggested);

      // Save to history automatically if logged in
      if (user) {
        saveActivityHistory(
          user.uid,
          "ats-analysis",
          fileInfo?.name ? `Analysis: ${fileInfo.name}` : (isMatchMode ? "ATS Match Scan" : "Resume Quality Scan"),
          { score: result.finalScore },
          resumeText
        ).catch(console.error);
      }

      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to perform ATS analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger AI Optimization Modal
  const handleOpenAiOptimizer = async () => {
    if (!resumeText) {
      toast.error("No resume text available for AI optimization.");
      return;
    }

    setIsAiModalOpen(true);
    setIsImproving(true);
    setImprovedText("");

    try {
      const token = (await user?.getIdToken()) || "";
      const textToImprove = resume.personalInfo.summary || resumeText.slice(0, 500);
      const improved = await improveSection("summary", textToImprove, token, jobDescription, "ats");
      setImprovedText(improved);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI optimization.");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER                                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <IconTile icon={FileSearch} variant="indigo" size="md" />
          <div>
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-xl sm:text-[24px] font-bold tracking-tight leading-none">
                <span className="text-slate-900 dark:text-slate-50">ATS </span>
                <span className="text-indigo-600 dark:text-violet-400 font-extrabold">Analyzer</span>
              </h1>
              <div className="hidden lg:inline-flex items-center ml-1 opacity-90">
                <ScriptAccent
                  text="Same You. Bigger Opportunities."
                  showFlourish={false}
                  className="text-xs scale-80 origin-left text-indigo-500 dark:text-indigo-400"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scan your resume against ATS algorithms and target job descriptions for instant score optimization.
            </p>
          </div>
        </div>

        {/* Right Header Action: Analyze History */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Analyze History</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 3-CARD INPUT WORKSPACE                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        {/* Card 1: Your Resume */}
        <YourResumeCard
          fileInfo={fileInfo}
          isProcessing={isProcessingFile}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onPreviewResume={() => setIsPreviewOpen(true)}
          onUseCurrentResume={handleUseCurrentResume}
          hasCurrentResume={!!resume.personalInfo.fullName}
        />

        {/* Card 2: Job Description */}
        <JobDescriptionCard
          jobDescription={jobDescription}
          onChange={setJobDescription}
          onClear={() => setJobDescription("")}
          maxLength={5000}
        />

        {/* Card 3: Tips for better results */}
        <TipsCard
          onSelectSample={(sampleId) => {
            const sample = SAMPLE_JOB_DESCRIPTIONS.find((s) => s.id === sampleId);
            if (sample) setJobDescription(sample.description);
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 3. FULL-WIDTH ANALYZE RESUME ACTION BAR                   */}
      {/* ========================================================= */}
      <div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning Resume Heuristics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>✨ Analyze Resume</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. 3-COLUMN EXPANDED RESULTS WORKSPACE                    */}
      {/* ========================================================= */}
      {atsResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ATS Analysis Results
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 ml-1">
                {atsResult.mode === "Match" ? "Target Job Match" : "Universal Quality"}
              </span>
            </div>

            {/* On-Demand View Resume Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-2xs transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Resume</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 items-stretch">
            {/* Result Column 1: ATS Score */}
            <ATSScoreCard
              score={atsResult.finalScore}
              categories={atsResult.breakdown}
              scoringMode={atsResult.mode}
            />

            {/* Result Column 2: Keyword Analysis (Expanded) */}
            <KeywordAnalysisCard
              matchedKeywords={matchedKeywords}
              missingKeywords={missingKeywords}
              suggestedKeywords={suggestedKeywords}
            />

            {/* Result Column 3: Insights & Actions */}
            <InsightsCard
              flags={atsResult.flags}
              score={atsResult.finalScore}
              onOpenAiOptimizer={handleOpenAiOptimizer}
              isAiLoading={isImproving}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ON-DEMAND RESUME PREVIEW MODAL                         */}
      {/* ========================================================= */}
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        resumeText={resumeText}
        structuredResume={fileInfo?.type === "Builder" ? resume : null}
        fileName={fileInfo?.name || "Analyzed Resume"}
      />

      {/* ========================================================= */}
      {/* 6. HISTORY DRAWER & AI OPTIMIZATION MODAL                 */}
      {/* ========================================================= */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={handleLoadHistoryItem}
      />

      <AIImprovementModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAccept={(text) => {
          setIsAiModalOpen(false);
          toast.success("Accepted AI improvement suggestion!");
        }}
        originalText={resume.personalInfo.summary || resumeText.slice(0, 300)}
        improvedText={improvedText}
        isImproving={isImproving}
        optimizationMode="ats"
        isJdActive={!!jobDescription}
      />
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <ResumeAnalyzerContent />
    </Suspense>
  );
}
