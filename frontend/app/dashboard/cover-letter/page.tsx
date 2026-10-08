"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import CoverLetterHeader from "@/components/cover-letter/CoverLetterHeader";
import FeatureHighlightRow from "@/components/cover-letter/FeatureHighlightRow";
import JobDetailsSection from "@/components/cover-letter/JobDetailsSection";
import YourContentSection from "@/components/cover-letter/YourContentSection";
import AdditionalInfoSection from "@/components/cover-letter/AdditionalInfoSection";
import CoverLetterPreviewCard from "@/components/cover-letter/CoverLetterPreviewCard";
import CoverLetterTemplatesGallery from "@/components/cover-letter/CoverLetterTemplatesGallery";
import SavedCoverLettersList from "@/components/cover-letter/SavedCoverLettersList";
import {
  CoverLetterTemplateId,
  SavedCoverLetterRecord,
} from "@/components/cover-letter/CoverLetterTypes";
import {
  generateCoverLetter,
  processCoverLetterAction,
} from "@/lib/coverLetterEngine";
import {
  saveActivityHistory,
  getHistoryItem,
  getRecentHistory,
  deleteHistoryItem,
} from "@/lib/historyService";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import { Plus, LayoutTemplate, Sparkles, FileText } from "lucide-react";

const PdfEditableViewer = dynamic(() => import("@/components/pdf/PdfEditableViewer"), {
  ssr: false,
});

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { resume } = useResume();
  const searchParams = useSearchParams();

  // Tab State: "create" | "templates" | "saved"
  const [activeTab, setActiveTab] = useState<"create" | "templates" | "saved">("create");

  // Form State
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional and Confident");
  const [sourceMode, setSourceMode] = useState<"builder" | "pdf" | "custom">("builder");
  const [customInput, setCustomInput] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [templateId, setTemplateId] = useState<CoverLetterTemplateId>("professional");

  // PDF Upload & Parser State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExtractedText, setPdfExtractedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Generation & AI Polish State
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState<"improve" | "shorten" | "impactful" | null>(null);

  // Saved Letters State
  const [savedLetters, setSavedLetters] = useState<SavedCoverLetterRecord[]>([]);

  // Format active resume from builder context
  const builderResumeText = React.useMemo(() => {
    const parts: string[] = [];
    if (resume.personalInfo.fullName) {
      parts.push(`Candidate Name: ${resume.personalInfo.fullName}`);
    }
    if (resume.title) {
      parts.push(`Title: ${resume.title}`);
    }
    if (resume.personalInfo.summary) {
      parts.push(`Summary: ${resume.personalInfo.summary}`);
    }
    if (resume.skills?.length > 0) {
      parts.push(`Skills: ${resume.skills.map((s) => s.name).join(", ")}`);
    }
    if (resume.experience?.length > 0) {
      parts.push(
        `Experience:\n${resume.experience
          .map((e) => `${e.position} at ${e.company} (${e.startDate} - ${e.endDate || "Present"}): ${e.description}`)
          .join("\n")}`
      );
    }
    if (resume.projects?.length > 0) {
      parts.push(
        `Projects:\n${resume.projects
          .map((p) => `${p.name}: ${p.description} (Tech: ${(p.technologies || []).join(", ")})`)
          .join("\n")}`
      );
    }
    return parts.join("\n\n");
  }, [resume]);

  // Load Saved Letters from Activity History
  const fetchSavedLetters = async () => {
    if (!user) return;
    try {
      const history = await getRecentHistory(user.uid);
      const clItems = history.filter((item) => item.type === "cover-letter");
      const mapped: SavedCoverLetterRecord[] = clItems.map((item) => ({
        id: item.id,
        title: item.title,
        company: item.metadata?.company || "Company",
        jobTitle: item.metadata?.jobTitle || "Role",
        createdAt: item.createdAt ? new Date(item.createdAt?.toMillis?.() || Date.now()).toLocaleDateString() : "Recent",
        content: item.contentSnapshot || "",
        templateId: "professional",
      }));
      setSavedLetters(mapped);
    } catch (e) {
      console.error("Failed to load saved letters", e);
    }
  };

  useEffect(() => {
    fetchSavedLetters();
  }, [user]);

  // History Rehydration from URL
  useEffect(() => {
    if (!user) return;
    const historyId = searchParams.get("historyId");
    if (!historyId) return;

    getHistoryItem(user.uid, historyId)
      .then((item) => {
        if (item && item.type === "cover-letter" && item.contentSnapshot) {
          setCoverLetterText(item.contentSnapshot);
          if (item.metadata?.jobTitle) setJobTitle(item.metadata.jobTitle);
          if (item.metadata?.company) setCompanyName(item.metadata.company);
          toast.success("Loaded cover letter from history");
        }
      })
      .catch(console.error);
  }, [user, searchParams]);

  // Handle PDF File Upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setPdfFile(file);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Resume PDF uploaded successfully");
    }, 800);
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    setPdfExtractedText("");
  };

  // Load from Job Search Helper
  const handleLoadFromJobSearch = () => {
    setJobTitle("Senior Frontend Engineer");
    setCompanyName("Razorpay");
    setJobDescription(
      "Architect and scale modern payment checkout experiences using React, Next.js, TypeScript, Tailwind CSS, and Web Performance Core Web Vitals."
    );
    toast.success("Loaded sample job details from Job Search");
  };

  // Generate Cover Letter
  const handleGenerate = async () => {
    if (!jobTitle.trim() || !companyName.trim()) {
      toast.error("Job Title and Company Name are required.");
      return;
    }

    const inputData =
      sourceMode === "builder"
        ? builderResumeText
        : sourceMode === "pdf"
        ? pdfExtractedText
        : customInput;

    if (!inputData.trim()) {
      toast.error(
        sourceMode === "pdf"
          ? "Please upload a resume PDF first."
          : sourceMode === "custom"
          ? "Please enter your background details."
          : "Active resume in Builder is empty. Add skills or experience in Builder."
      );
      return;
    }

    setIsGenerating(true);
    try {
      const token = (await user?.getIdToken()) || "";
      const combinedInput = additionalInfo.trim()
        ? `${inputData}\n\nAdditional Guidance: ${additionalInfo.trim()}`
        : inputData;

      const result = await generateCoverLetter(
        {
          resumeText: sourceMode !== "custom" ? combinedInput : undefined,
          customInput: sourceMode === "custom" ? combinedInput : undefined,
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          jobDescription: jobDescription.trim(),
          tone,
        },
        token
      );

      setCoverLetterText(result);
      toast.success("Cover letter generated successfully!");

      if (user) {
        await saveActivityHistory(
          user.uid,
          "cover-letter",
          `Cover Letter — ${companyName.trim()}`,
          { company: companyName.trim(), jobTitle: jobTitle.trim() },
          result,
          { templateId }
        );
        fetchSavedLetters();
      }
    } catch (err: any) {
      console.error("Cover letter error:", err);
      toast.error(err.message || "Failed to generate cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Refinement Actions
  const handleAiAction = async (action: "improve" | "shorten" | "impactful") => {
    if (!coverLetterText.trim()) return;

    setAiActionLoading(action);
    try {
      const token = (await user?.getIdToken()) || "";
      const result = await processCoverLetterAction(
        { currentText: coverLetterText, action },
        token
      );
      setCoverLetterText(result);
      toast.success(
        action === "improve"
          ? "Cover letter polished with stronger verbs!"
          : action === "shorten"
          ? "Cover letter shortened for conciseness!"
          : "Enhanced impact and authoritative tone!"
      );
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} cover letter.`);
    } finally {
      setAiActionLoading(null);
    }
  };

  // Export to DOCX
  const handleExportWord = async () => {
    if (!coverLetterText.trim()) return;

    const paragraphs = coverLetterText.split("\n\n").map(
      (para) =>
        new Paragraph({
          children: [new TextRun({ text: para, font: "Arial", size: 24 })],
          spacing: { after: 200 },
        })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Cover_Letter_${companyName.trim().replace(/\s+/g, "_") || "Document"}.docx`);
    toast.success("Downloaded Word document (.docx)");
  };

  // Export to PDF
  const handleExportPdf = async () => {
    if (!coverLetterText.trim()) return;

    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 10.5;
      const lineHeight = 1.35;
      const margin = 50;
      const { width, height } = page.getSize();
      let y = height - margin;

      // Candidate Header
      const name = resume.personalInfo.fullName || "Candidate Name";
      page.drawText(name, { x: margin, y, size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.2) });
      y -= 18;

      const title = resume.title || jobTitle || "Professional";
      page.drawText(title, { x: margin, y, size: 10, font, color: rgb(0.35, 0.35, 0.6) });
      y -= 24;

      const paragraphs = coverLetterText.split("\n\n");

      for (const para of paragraphs) {
        const words = para.split(" ");
        let line = "";
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > width - margin * 2 && i > 0) {
            page.drawText(line.trim(), { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
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

        page.drawText(line.trim(), { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        y -= fontSize * lineHeight * 1.8;
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      saveAs(blob, `Cover_Letter_${companyName.trim().replace(/\s+/g, "_") || "Document"}.pdf`);
      toast.success("Downloaded PDF document");
    } catch (err) {
      console.error("PDF Export error:", err);
      toast.error("Failed to export PDF.");
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (coverLetterText.trim()) {
      navigator.clipboard.writeText(coverLetterText);
      toast.success("Cover letter copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Header matching PDF Page 5 */}
      <CoverLetterHeader
        onSavedClick={() => setActiveTab("saved")}
        savedCount={savedLetters.length}
      />

      {/* 2. Top Feature Row (4 Highlight Cards) */}
      <FeatureHighlightRow />

      {/* 3. Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Creation Area (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "create"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "templates"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "saved"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Saved ({savedLetters.length})</span>
            </button>
          </div>

          {activeTab === "create" && (
            <div className="space-y-4">
              {/* 1. Job Details Section */}
              <JobDetailsSection
                jobTitle={jobTitle}
                onJobTitleChange={setJobTitle}
                companyName={companyName}
                onCompanyNameChange={setCompanyName}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onLoadFromJobSearch={handleLoadFromJobSearch}
              />

              {/* 2. Your Content Section */}
              <YourContentSection
                sourceMode={sourceMode}
                onSourceModeChange={setSourceMode}
                resumeFileName={
                  resume.personalInfo.fullName
                    ? `${resume.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
                    : undefined
                }
                pdfFile={pdfFile}
                onFileChange={handlePdfUpload}
                onClearPdf={handleClearPdf}
                isUploading={isUploading}
                resumeText={pdfExtractedText}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
              />

              {/* 3. Additional Info & Action */}
              <AdditionalInfoSection
                additionalInfo={additionalInfo}
                onAdditionalInfoChange={setAdditionalInfo}
                tone={tone}
                onToneChange={setTone}
                isLoading={isGenerating}
                onGenerate={handleGenerate}
                disabled={!jobTitle.trim() || !companyName.trim()}
              />
            </div>
          )}

          {activeTab === "templates" && (
            <CoverLetterTemplatesGallery
              selectedTemplateId={templateId}
              onSelectTemplate={(id) => {
                setTemplateId(id);
                setActiveTab("create");
                toast.success(`Selected ${id.toUpperCase()} template`);
              }}
            />
          )}

          {activeTab === "saved" && (
            <SavedCoverLettersList
              savedLetters={savedLetters}
              onSelectLetter={(letter) => {
                setCoverLetterText(letter.content);
                setCompanyName(letter.company);
                setJobTitle(letter.jobTitle);
                setTemplateId(letter.templateId);
                setActiveTab("create");
                toast.success(`Loaded "${letter.title}"`);
              }}
              onDeleteLetter={async (id) => {
                setSavedLetters((prev) => prev.filter((l) => l.id !== id));
                if (user) {
                  try {
                    await deleteHistoryItem(user.uid, id);
                  } catch (e) {
                    console.error("Failed to delete history item", e);
                  }
                }
                toast.info("Removed from saved list");
              }}
              onCreateNew={() => setActiveTab("create")}
            />
          )}
        </div>

        {/* Right Column: Cover Letter Preview (6 Cols) */}
        <div className="lg:col-span-6 sticky top-6">
          <CoverLetterPreviewCard
            coverLetterText={coverLetterText}
            onCoverLetterTextChange={setCoverLetterText}
            templateId={templateId}
            onTemplateChange={setTemplateId}
            candidateName={resume.personalInfo.fullName || "Candidate Name"}
            candidateTitle={resume.title || jobTitle || "Software Engineer"}
            candidateEmail={resume.personalInfo.email}
            candidatePhone={resume.personalInfo.phone}
            companyName={companyName}
            jobTitle={jobTitle}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onRegenerate={handleGenerate}
            onAiAction={handleAiAction}
            aiActionLoading={aiActionLoading}
            onCopy={handleCopy}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Hidden PDF text extractor component for uploaded PDFs */}
      <div className="hidden">
        {pdfFile && (
          <PdfEditableViewer
            file={pdfFile}
            onTextUpdate={(extracted) => setPdfExtractedText(extracted)}
          />
        )}
      </div>
    </div>
  );
}
