"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { exportToWord } from "@/lib/exportService";
import { Resume } from "@/types/resume";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivityHistory, getHistoryItem } from "@/lib/historyService";
import { analyzeResume } from "@/lib/atsAnalyzer";
import { toast } from "sonner";

// Shared HireLens Components
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";
import SegmentedToggle from "@/components/common/SegmentedToggle";

// Forms
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SummaryForm from "./forms/SummaryForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import ProjectsForm from "./forms/ProjectsForm";
import AchievementsForm from "./forms/AchievementsForm";
import CertificationsForm from "./forms/CertificationsForm";
import LanguagesForm from "./forms/LanguagesForm";
import InterestsForm from "./forms/InterestsForm";

// Preview & Templates
import ResumePreview from "./preview/ResumePreview";
import TemplateSwitcher from "./preview/TemplateSwitcher";

// Icons
import {
    Save,
    Download,
    Eye,
    ChevronDown,
    User,
    FileText,
    GraduationCap,
    Briefcase,
    FolderGit2,
    Sparkles,
    Award,
    Trophy,
    Globe,
    Heart,
    Check,
    AlertCircle,
    Lightbulb,
    Monitor,
    Smartphone,
    Maximize2,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

type FormSection =
    | "personal"
    | "summary"
    | "education"
    | "experience"
    | "projects"
    | "skills"
    | "certifications"
    | "achievements"
    | "languages"
    | "interests";

interface SectionConfig {
    id: FormSection;
    label: string;
    icon: typeof User;
}

const SECTIONS: SectionConfig[] = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Professional Summary", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "languages", label: "Languages", icon: Globe },
    { id: "interests", label: "Interests", icon: Heart },
];

export default function ResumeEditor() {
    const { resume, updateResume, setResume } = useResume();
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeSection, setActiveSection] = useState<FormSection>("personal");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const [zoomLevel, setZoomLevel] = useState<number>(0.84);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [jobDescription, setJobDescription] = useState<string>("");
    const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);
    const [downloadMenuOpen, setDownloadMenuOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

    const resumeRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Rehydration from History
    useEffect(() => {
        if (!user) return;
        const historyId = searchParams.get("historyId");
        if (!historyId) return;

        getHistoryItem(user.uid, historyId)
            .then((item) => {
                if (item && item.type === "resume" && item.structuredData) {
                    setResume(item.structuredData);
                    toast.success("Loaded resume from history");
                }
            })
            .catch(console.error);
    }, [user, searchParams, setResume]);

    // ATS Calculation for export & history
    const atsResult = useMemo(() => {
        return analyzeResume(resume, isOverflowing);
    }, [resume, isOverflowing]);

    // Print / PDF
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${resume.personalInfo.fullName ? resume.personalInfo.fullName.replace(/\s+/g, "_") : "Resume"}_HireLens`,
    });

    // Overflow Detection
    useEffect(() => {
        const checkOverflow = () => {
            if (resumeRef.current) {
                setIsOverflowing(resumeRef.current.scrollHeight > 1128);
            }
        };

        checkOverflow();
        const observer = new ResizeObserver(() => checkOverflow());
        if (resumeRef.current) {
            observer.observe(resumeRef.current);
        }
        return () => observer.disconnect();
    }, [resume, previewDevice]);

    // Close download menu when clicking outside
    useEffect(() => {
        const closeDropdown = () => setDownloadMenuOpen(false);
        if (downloadMenuOpen) {
            window.addEventListener("click", closeDropdown);
        }
        return () => window.removeEventListener("click", closeDropdown);
    }, [downloadMenuOpen]);

    // Section Completion Logic
    const completionMap = useMemo<Record<FormSection, boolean>>(() => {
        return {
            personal: Boolean(
                resume.personalInfo?.fullName?.trim() &&
                resume.personalInfo?.email?.trim() &&
                resume.personalInfo?.phone?.trim()
            ),
            summary: Boolean(
                resume.personalInfo?.summary &&
                resume.personalInfo.summary.trim().length >= 20
            ),
            education: (resume.education?.length || 0) > 0,
            experience: (resume.experience?.length || 0) > 0,
            projects: (resume.projects?.length || 0) > 0,
            skills: (resume.skills?.length || 0) >= 3,
            certifications: (resume.certifications?.length || 0) > 0,
            achievements: (resume.achievements?.length || 0) > 0,
            languages: ((resume as any).languages?.length || 0) > 0,
            interests: ((resume as any).interests?.length || 0) > 0,
        };
    }, [resume]);

    // Dynamic completion percentage
    const completionPercentage = useMemo(() => {
        const completed = Object.values(completionMap).filter(Boolean).length;
        const total = SECTIONS.length;
        return Math.round((completed / total) * 100);
    }, [completionMap]);

    // Save handler
    const handleSave = async () => {
        if (!user) {
            toast.error("Please sign in to save resume.");
            return;
        }
        try {
            setIsSaving(true);
            await saveActivityHistory(
                user.uid,
                "resume",
                resume.title || resume.personalInfo.fullName || "Untitled Resume",
                {
                    score: atsResult.overallScore,
                },
                "",
                resume
            );
            toast.success("Resume saved successfully!");
        } catch (e) {
            toast.error("Failed to save resume.");
        } finally {
            setIsSaving(false);
        }
    };

    // Pro Tip by section
    const getProTip = (section: FormSection) => {
        switch (section) {
            case "personal":
                return "Add a portfolio link or GitHub profile to showcase your code. It can significantly improve recruiter interest!";
            case "summary":
                return "Keep your summary between 20–60 words. Highlight your strongest skills, metrics, and core tech stack.";
            case "education":
                return "Include relevant coursework, honors, or GPA if above 3.5 to demonstrate academic rigor.";
            case "experience":
                return "Begin bullet points with strong action verbs (e.g. Architected, Accelerated, Reduced) and quantify results.";
            case "projects":
                return "Include GitHub links and live demos. Detail the tech stack and direct impact of your contributions.";
            case "skills":
                return "Group skills into Languages, Frameworks, Databases, and Tools matching target role requirements.";
            case "certifications":
                return "Highlight recognized credentials (AWS, GCP, CKA) with active validation dates.";
            case "achievements":
                return "List awards, hackathon wins, top leaderboard rankings, or open source contributions.";
            case "languages":
                return "Specify language proficiencies (Native, Fluent, Professional) for global role matching.";
            case "interests":
                return "Mention authentic hobbies that demonstrate teamwork, problem-solving, or creative curiosity.";
        }
    };

    return (
        <div className="flex flex-col space-y-4.5 pb-12">
            {/* Hidden component for Print / PDF Export */}
            <div className="hidden">
                <div ref={printRef} className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8">
                    <ResumePreview resume={resume} />
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. STYLISH TWO-TONE HIERARCHY HEADER                      */}
            {/* ========================================================= */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                {/* Left: IconTile + Stylish Two-Tone Title + Subtitle + Secondary Script */}
                <div className="flex items-center gap-3.5">
                    <IconTile icon={FileText} variant="indigo" size="md" />
                    <div>
                        <div className="flex flex-wrap items-baseline gap-2.5">
                            {/* Two-Tone Title: "Resume" in Primary Heading, "Builder" in HireLens Accent */}
                            <h1 className="text-xl sm:text-[24px] font-bold tracking-tight leading-none">
                                <span className="text-slate-900 dark:text-slate-50">Resume</span>
                                {" "}
                                <span className="text-indigo-600 dark:text-violet-400 font-extrabold">Builder</span>
                            </h1>

                            {/* Secondary Decorative Script Accent */}
                            <div className="hidden lg:inline-flex items-center ml-1 opacity-90">
                                <ScriptAccent
                                    text="Same You. Bigger Opportunities."
                                    showFlourish={false}
                                    className="text-xs scale-80 origin-left text-indigo-500 dark:text-indigo-400"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Create, edit, and optimize your resume with the power of AI.
                        </p>
                    </div>
                </div>

                {/* Right: Aligned Compact Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{isSaving ? "Saving..." : "Save"}</span>
                    </button>

                    {/* Preview Button */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreenPreview(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all"
                    >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Preview</span>
                    </button>

                    {/* Download PDF Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDownloadMenuOpen(!downloadMenuOpen);
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-xs transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        {downloadMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDownloadMenuOpen(false);
                                        handlePrint();
                                    }}
                                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Download PDF (.pdf)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDownloadMenuOpen(false);
                                        exportToWord();
                                    }}
                                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Export Word (.docx)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl">
                <button
                    onClick={() => setMobileTab("editor")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        mobileTab === "editor"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setMobileTab("preview")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        mobileTab === "preview"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                    Live Preview
                </button>
            </div>

            {/* ========================================================= */}
            {/* 2. THREE-COLUMN WORKSPACE (Hero Resume Preview)           */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[200px_350px_1fr] gap-4 items-start">

                {/* --------------------------------------------------------- */}
                {/* COLUMN 1: RESUME SECTIONS RAIL (Compact Navigation)       */}
                {/* --------------------------------------------------------- */}
                <div
                    className={`lg:col-span-3 xl:col-span-1 flex flex-col p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs ${
                        mobileTab === "editor" ? "block" : "hidden md:flex"
                    }`}
                >
                    {/* Header: Title & Completion % */}
                    <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Sections
                            </h2>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                {completionPercentage}% Done
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Section Item List */}
                    <nav className="space-y-0.5 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
                        {SECTIONS.map((sec) => {
                            const Icon = sec.icon;
                            const isActive = activeSection === sec.id;
                            const isComplete = completionMap[sec.id];

                            return (
                                <button
                                    key={sec.id}
                                    type="button"
                                    onClick={() => setActiveSection(sec.id)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                                        isActive
                                            ? "bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/40 shadow-2xs"
                                            : "border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 hover:text-slate-900 hover:border-slate-200/60 dark:hover:bg-slate-800/90 dark:hover:text-slate-200 dark:hover:border-slate-700/60 font-medium"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Icon
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                                isActive
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-400 dark:text-slate-500"
                                            }`}
                                        />
                                        <span className="truncate text-[11.5px]">{sec.label}</span>
                                    </div>

                                    {/* 3-State Indicator */}
                                    <div className="shrink-0 ml-1">
                                        {isComplete ? (
                                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                                <Check className="w-2 h-2 stroke-[3]" />
                                            </div>
                                        ) : (
                                            <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Optional JD Optimization Expandable Link */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setJdPanelOpen(!jdPanelOpen)}
                            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                {jobDescription ? "JD Active ✓" : "Target Job Description"}
                            </span>
                            <span className="text-[10px]">{jdPanelOpen ? "▲" : "▼"}</span>
                        </button>
                        {jdPanelOpen && (
                            <div className="mt-2 space-y-1.5">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value.substring(0, 5000))}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                                    placeholder="Paste job description to tailor AI suggestions..."
                                />
                                {jobDescription && (
                                    <button
                                        type="button"
                                        onClick={() => setJobDescription("")}
                                        className="text-[10px] text-red-500 hover:underline"
                                    >
                                        Clear JD Context
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* COLUMN 2: ACTIVE FORM (Compact & Lightweight Workspace)   */}
                {/* --------------------------------------------------------- */}
                <div
                    className={`lg:col-span-4 xl:col-span-1 flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-h-[580px] ${
                        mobileTab === "editor" ? "block" : "hidden md:flex"
                    }`}
                >
                    {/* Active Form Content */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 pb-2">
                        {activeSection === "personal" && (
                            <PersonalInfoForm
                                data={resume.personalInfo}
                                title={resume.title}
                                onTitleChange={(title) => updateResume({ title })}
                                onChange={(personalInfo) => updateResume({ personalInfo })}
                            />
                        )}

                        {activeSection === "summary" && (
                            <SummaryForm
                                summary={resume.personalInfo.summary || ""}
                                onChange={(summary) =>
                                    updateResume({
                                        personalInfo: { ...resume.personalInfo, summary },
                                    })
                                }
                                jobDescription={jobDescription}
                            />
                        )}

                        {activeSection === "experience" && (
                            <ExperienceForm
                                data={resume.experience}
                                onChange={(experience) => updateResume({ experience })}
                                jobDescription={jobDescription}
                            />
                        )}

                        {activeSection === "education" && (
                            <EducationForm
                                data={resume.education}
                                onChange={(education) => updateResume({ education })}
                            />
                        )}

                        {activeSection === "skills" && (
                            <SkillsForm
                                data={resume.skills}
                                onChange={(skills) => updateResume({ skills })}
                            />
                        )}

                        {activeSection === "projects" && (
                            <ProjectsForm
                                data={resume.projects}
                                onChange={(projects) => updateResume({ projects })}
                                jobDescription={jobDescription}
                            />
                        )}

                        {activeSection === "certifications" && (
                            <CertificationsForm
                                data={resume.certifications || []}
                                onChange={(certifications) => updateResume({ certifications })}
                                jobDescription={jobDescription}
                            />
                        )}

                        {activeSection === "achievements" && (
                            <AchievementsForm
                                data={resume.achievements || []}
                                onChange={(achievements) => updateResume({ achievements })}
                                jobDescription={jobDescription}
                            />
                        )}

                        {activeSection === "languages" && (
                            <LanguagesForm
                                languages={(resume as any).languages || []}
                                onChange={(languages) => updateResume({ ...resume, languages } as any)}
                            />
                        )}

                        {activeSection === "interests" && (
                            <InterestsForm
                                interests={(resume as any).interests || []}
                                onChange={(interests) => updateResume({ ...resume, interests } as any)}
                            />
                        )}
                    </div>

                    {/* Compact Pro Tip Card */}
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/75 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200 shadow-2xs shrink-0">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="leading-snug">
                            <strong className="font-semibold text-amber-950 dark:text-amber-100">Pro Tip:</strong>{" "}
                            {getProTip(activeSection)}
                        </p>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* COLUMN 3: RESUME PREVIEW (Hero Dominant Workspace)        */}
                {/* --------------------------------------------------------- */}
                <div
                    className={`lg:col-span-5 xl:col-span-1 flex-1 flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 min-h-[580px] ${
                        mobileTab === "preview" ? "block" : "hidden md:flex"
                    }`}
                >
                    {/* Preview Header: Title + Template Switcher + Desktop/Mobile Toggle + Zoom + Maximize */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Resume Preview
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Template Selector dropdown / buttons */}
                            <TemplateSwitcher
                                currentTemplate={resume.template}
                                onChange={(template) => updateResume({ template })}
                            />

                            {/* Zoom controls */}
                            {previewDevice === "desktop" && (
                                <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.08))}
                                        className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-3 h-3" />
                                    </button>
                                    <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 px-1 min-w-[32px] text-center">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel((z) => Math.min(1.15, z + 0.08))}
                                        className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Desktop / Mobile Toggle */}
                            <SegmentedToggle
                                options={[
                                    { value: "desktop", label: "Desktop", icon: <Monitor className="w-3.5 h-3.5" /> },
                                    { value: "mobile", label: "Mobile", icon: <Smartphone className="w-3.5 h-3.5" /> },
                                ]}
                                value={previewDevice}
                                onChange={(val) => setPreviewDevice(val as "desktop" | "mobile")}
                                size="sm"
                            />

                            {/* Maximize preview */}
                            <button
                                type="button"
                                onClick={() => setIsFullscreenPreview(true)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Expand Fullscreen"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Overflow warning */}
                    {isOverflowing && (
                        <div className="mb-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>Resume exceeds 1 page. Shorten descriptions for best ATS compliance.</span>
                        </div>
                    )}

                    {/* Generous Live Preview Document Surface */}
                    <div className="flex-1 bg-slate-100/70 dark:bg-slate-950/80 rounded-xl p-4 sm:p-6 overflow-y-auto custom-scrollbar flex justify-center items-start min-h-[520px]">
                        {previewDevice === "desktop" ? (
                            /* Desktop Sheet View: spacious & readable scaled A4 document */
                            <div className="w-full flex justify-center origin-top overflow-x-auto custom-scrollbar py-2">
                                <div
                                    ref={resumeRef}
                                    style={{ transform: `scale(${zoomLevel})` }}
                                    className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl border border-slate-200/90 rounded-sm origin-top p-8 transition-transform duration-200"
                                >
                                    <ResumePreview resume={resume} />
                                </div>
                            </div>
                        ) : (
                            /* Mobile Device View */
                            <div className="max-w-[340px] w-full bg-slate-900 rounded-[30px] p-3 shadow-2xl border-4 border-slate-800 my-2">
                                <div className="h-4 flex justify-center items-center pb-1">
                                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                                </div>
                                <div className="bg-white rounded-[18px] overflow-y-auto custom-scrollbar max-h-[500px] p-4 text-xs text-slate-900">
                                    <ResumePreview resume={resume} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. FULLSCREEN PREVIEW MODAL                                */}
            {/* ========================================================= */}
            {isFullscreenPreview && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col">
                    {/* Modal Toolbar */}
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Document Preview
                            </h2>
                            <TemplateSwitcher
                                currentTemplate={resume.template}
                                onChange={(template) => updateResume({ template })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={exportToWord}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                            >
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Word (.docx)</span>
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFullscreenPreview(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-y-auto custom-scrollbar p-6 flex justify-center items-start">
                        <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-8 rounded-sm">
                            <ResumePreview resume={resume} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
