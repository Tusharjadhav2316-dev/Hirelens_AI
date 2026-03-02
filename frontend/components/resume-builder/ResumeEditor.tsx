"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { exportToWord } from "@/lib/exportService";
import { Resume } from "@/types/resume";
import { defaultResume } from "@/lib/defaultResume";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import ProjectsForm from "./forms/ProjectsForm";
import AchievementsForm from "./forms/AchievementsForm";
import CertificationsForm from "./forms/CertificationsForm";
import ResumePreview from "./preview/ResumePreview";
import TemplateSwitcher from "./preview/TemplateSwitcher";
import { Save, Download, Eye, FileText, AlertTriangle } from "lucide-react";
import ATSScorePanel from "./ATSScorePanel";
import { analyzeResume } from "@/lib/atsAnalyzer";
import { useResume } from "@/contexts/ResumeContext";
import { saveActivityHistory, getHistoryItem } from "@/lib/historyService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

type FormSection = "personal" | "experience" | "education" | "skills" | "projects" | "achievements" | "certifications";

export default function ResumeEditor() {
    const { resume, updateResume, setResume } = useResume();
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<FormSection>("personal");
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // Rehydration from History
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!user) return;
        const historyId = searchParams.get("historyId");
        if (!historyId) return;

        getHistoryItem(user.uid, historyId).then(item => {
            if (item && item.type === "resume" && item.structuredData) {
                setResume(item.structuredData);
                toast.success("Loaded resume from history");
            }
        }).catch(console.error);
    }, [user, setResume]);

    const resumeRef = useRef<HTMLDivElement>(null);

    const atsResult = useMemo(() => {
        return analyzeResume(resume, isOverflowing);
    }, [resume, isOverflowing]);

    const handlePrint = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: `${resume.personalInfo.fullName ? resume.personalInfo.fullName.replace(/\s+/g, '_') : "Resume"}_Resume`,
    });

    useEffect(() => {
        const checkOverflow = () => {
            if (resumeRef.current) {
                // A4 height at 96 DPI is approx 1123px.
                setIsOverflowing(resumeRef.current.scrollHeight > 1128);
            }
        };

        checkOverflow();

        const observer = new ResizeObserver(() => checkOverflow());
        if (resumeRef.current) {
            observer.observe(resumeRef.current);
        }
        return () => observer.disconnect();
    }, [resume, isPreviewMode]);

    return (
        <div className={`flex gap-6 ${isPreviewMode ? "h-auto" : "flex-col lg:flex-row h-[calc(100vh-8rem)]"}`}>
            {/* Left Panel: Form Sections */}
            {!isPreviewMode && (
                <div className="w-full lg:w-[400px] lg:shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="flex p-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                        <div className="flex gap-2">
                            {["personal", "experience", "education", "skills", "projects", "achievements", "certifications"].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section as FormSection)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeSection === section
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeSection === "personal" && (
                            <PersonalInfoForm data={resume.personalInfo} onChange={(personalInfo) => updateResume({ personalInfo })} />
                        )}
                        {activeSection === "experience" && (
                            <ExperienceForm data={resume.experience} onChange={(data) => updateResume({ experience: data })} />
                        )}
                        {activeSection === "education" && (
                            <EducationForm data={resume.education} onChange={(data) => updateResume({ education: data })} />
                        )}
                        {activeSection === "skills" && (
                            <SkillsForm data={resume.skills} onChange={(data) => updateResume({ skills: data })} />
                        )}
                        {activeSection === "projects" && (
                            <ProjectsForm data={resume.projects} onChange={(data) => updateResume({ projects: data })} />
                        )}
                        {activeSection === "achievements" && (
                            <AchievementsForm data={resume.achievements} onChange={(data) => updateResume({ achievements: data })} />
                        )}
                        {activeSection === "certifications" && (
                            <CertificationsForm data={resume.certifications} onChange={(data) => updateResume({ certifications: data })} />
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {resume.title} • Last saved: Just now
                        </p>
                        <button onClick={async () => {
                            if (!user) {
                                toast.error("Please sign in to save resume.");
                                return;
                            }
                            try {
                                await saveActivityHistory(
                                    user.uid,
                                    "resume",
                                    resume.title || "Untitled Resume",
                                    {},
                                    "",
                                    resume
                                );
                                toast.success("Resume saved to history.");
                            } catch (e) {
                                toast.error("Failed to save resume.");
                            }
                        }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Save className="w-4 h-4" /> Save
                        </button>
                    </div>
                </div>
            )}

            {/* Center Panel: Live Preview & Template Selection */}
            <div className={`${isPreviewMode ? "fixed inset-0 z-50 bg-slate-200 overflow-y-auto w-full h-full flex flex-col" : "flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden min-w-[500px]"}`}>

                {/* Header Toolbar */}
                {isPreviewMode ? (
                    <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden w-full shrink-0">
                        <h2 className="text-lg font-semibold text-slate-800">Document Preview</h2>
                        <div className="flex gap-3">
                            <button onClick={() => setIsPreviewMode(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors">
                                Back to Editor
                            </button>
                            <button onClick={exportToWord} className="px-4 py-2 flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium transition-colors">
                                <FileText className="w-4 h-4" /> Word (.docx)
                            </button>
                            <button onClick={() => handlePrint()} className="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" /> Save PDF
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="absolute top-0 inset-x-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 flex items-center justify-between px-4">
                        <TemplateSwitcher currentTemplate={resume.template} onChange={(template) => updateResume({ template })} />

                        <div className="flex items-center gap-2">
                            <button onClick={exportToWord} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors" title="Download Word (.docx)">
                                <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsPreviewMode(true)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors" title="Preview Full Screen">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handlePrint()} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors" title="Download PDF">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Overflow Warning Indicator */}
                {isOverflowing && (
                    <div className={`${isPreviewMode ? "max-w-[794px] mx-auto mt-6 mb-2 shrink-0 rounded-md" : "absolute top-14 inset-x-0 z-10"} bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 flex items-center justify-center gap-2 print:hidden`}>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">Your resume exceeds one page. Please shorten content for ATS compliance.</span>
                    </div>
                )}

                {/* Preview Area */}
                <div className={`flex-1 flex justify-center w-full ${isPreviewMode ? (isOverflowing ? "pt-2" : "pt-10") + " pb-10" : "overflow-y-auto custom-scrollbar pt-20 pb-8 px-4 lg:px-8"}`}>
                    <div
                        ref={resumeRef}
                        className={`w-[794px] min-h-[1123px] bg-white relative ${isPreviewMode ? "shadow-sm" : "shadow-lg"} print:shadow-none print:w-[794px] print:h-[1123px] print:overflow-hidden ${isOverflowing && isPreviewMode ? 'ring-2 ring-amber-400' : ''}`}
                    >
                        <ResumePreview resume={resume} />
                    </div>
                </div>
            </div>

            {/* Right Panel: ATS Intelligence */}
            {!isPreviewMode && (
                <div className="w-full lg:w-[350px] lg:shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
                    <ATSScorePanel result={atsResult} />
                </div>
            )}
        </div>
    );
}
