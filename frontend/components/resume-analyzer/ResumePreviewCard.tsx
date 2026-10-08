"use client";

import { useState } from "react";
import SegmentedToggle from "@/components/common/SegmentedToggle";
import { Monitor, Smartphone, FileText } from "lucide-react";
import { Resume } from "@/types/resume";

interface ResumePreviewCardProps {
  resumeText: string;
  structuredResume?: Resume | null;
}

export default function ResumePreviewCard({
  resumeText,
  structuredResume,
}: ResumePreviewCardProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header with Segmented Toggle */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resume Preview</h3>
        </div>

        <SegmentedToggle
          size="sm"
          value={deviceMode}
          onChange={(val) => setDeviceMode(val)}
          options={[
            { value: "desktop", label: "Desktop", icon: <Monitor className="w-3 h-3" /> },
            { value: "mobile", label: "Mobile", icon: <Smartphone className="w-3 h-3" /> },
          ]}
        />
      </div>

      {/* Preview Container: Dark canvas containing physical WHITE SHEET */}
      <div className="flex-1 bg-slate-100/80 dark:bg-slate-950/60 rounded-xl p-3 sm:p-4 flex items-center justify-center overflow-y-auto max-h-[380px] custom-scrollbar border border-slate-200/60 dark:border-slate-800/60">
        <div
          className={`transition-all duration-300 bg-white text-slate-900 shadow-md border border-slate-200/80 rounded-lg p-5 sm:p-6 overflow-y-auto ${
            deviceMode === "desktop"
              ? "w-full min-h-[320px] text-xs leading-relaxed"
              : "w-[240px] min-h-[320px] text-[10px] leading-normal"
          }`}
        >
          {structuredResume && structuredResume.personalInfo.fullName ? (
            /* Structured Resume View */
            <div className="space-y-3 font-sans">
              <div className="border-b border-slate-200 pb-2 text-center">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-950 tracking-tight">
                  {structuredResume.personalInfo.fullName}
                </h4>
                {structuredResume.experience && structuredResume.experience[0]?.position && (
                  <p className="text-indigo-600 font-semibold text-[11px] mt-0.5">
                    {structuredResume.experience[0].position}
                  </p>
                )}
                <p className="text-slate-500 text-[10px] mt-0.5">
                  {[
                    structuredResume.personalInfo.email,
                    structuredResume.personalInfo.phone,
                    structuredResume.personalInfo.location,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>

              {structuredResume.personalInfo.summary && (
                <div>
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5 mb-1">
                    Summary
                  </h5>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {structuredResume.personalInfo.summary}
                  </p>
                </div>
              )}

              {structuredResume.experience && structuredResume.experience.length > 0 && (
                <div>
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5 mb-1">
                    Experience
                  </h5>
                  <div className="space-y-2">
                    {structuredResume.experience.map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between font-bold text-[11px] text-slate-900">
                          <span>{exp.position}</span>
                          <span className="text-slate-500 font-normal">{exp.startDate} - {exp.endDate || "Present"}</span>
                        </div>
                        <p className="text-indigo-600 text-[10.5px] font-medium">{exp.company}</p>
                        <p className="text-slate-600 text-[10.5px] mt-0.5 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {structuredResume.skills && structuredResume.skills.length > 0 && (
                <div>
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5 mb-1">
                    Skills
                  </h5>
                  <p className="text-slate-700 text-[11px]">
                    {structuredResume.skills.map((s) => s.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          ) : resumeText ? (
            /* Plain Text Extracted View */
            <div className="font-mono text-[11px] whitespace-pre-wrap text-slate-800 leading-relaxed">
              {resumeText}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-10">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No resume text to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
