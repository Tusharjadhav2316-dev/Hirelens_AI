"use client";

import { useResume } from "@/contexts/ResumeContext";
import JDMatcherPanel from "@/components/resume-builder/JDMatcherPanel";
import { Sparkles } from "lucide-react";

export default function JobMatcherPage() {
    const { resume } = useResume();

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    Job Description Matcher
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        Beta
                    </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Optimize your resume for a specific role. Paste the job description below to get an instant ATS alignment score and AI-driven improvement suggestions.
                </p>

                {resume.personalInfo.fullName && (
                    <div className="mt-4 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 inline-block border border-slate-200 dark:border-slate-800">
                        Currently optimizing for: <span className="font-semibold text-slate-800 dark:text-white">{resume.personalInfo.fullName} - {resume.title || "Untitled Resume"}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <JDMatcherPanel resume={resume} />
            </div>
        </div>
    );
}
