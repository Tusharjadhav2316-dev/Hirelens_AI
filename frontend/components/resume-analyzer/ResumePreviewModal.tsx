"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SegmentedToggle from "@/components/common/SegmentedToggle";
import { Monitor, Smartphone, FileText, X, Download } from "lucide-react";
import { Resume } from "@/types/resume";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  structuredResume?: Resume | null;
  fileName?: string;
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  resumeText,
  structuredResume,
  fileName = "Resume Preview",
}: ResumePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden bg-slate-900/95 border border-slate-800 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
                {fileName}
              </DialogTitle>
              <p className="text-xs text-slate-400">ATS Analyzed Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SegmentedToggle
              size="sm"
              value={deviceMode}
              onChange={(val) => setDeviceMode(val)}
              options={[
                { value: "desktop", label: "Desktop", icon: <Monitor className="w-3.5 h-3.5" /> },
                { value: "mobile", label: "Mobile", icon: <Smartphone className="w-3.5 h-3.5" /> },
              ]}
            />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Dark canvas containing physical WHITE SHEET */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-8 flex items-center justify-center overflow-y-auto max-h-[75vh] custom-scrollbar">
          <div
            className={`transition-all duration-300 bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-xl p-8 sm:p-10 ${
              deviceMode === "desktop"
                ? "w-full max-w-[720px] min-h-[500px] text-xs leading-relaxed"
                : "w-[320px] min-h-[500px] text-[10.5px] leading-normal"
            }`}
          >
            {structuredResume && structuredResume.personalInfo.fullName ? (
              /* Structured Resume View */
              <div className="space-y-4 font-sans text-slate-900">
                <div className="border-b-2 border-slate-900 pb-3 text-center">
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-950 tracking-tight">
                    {structuredResume.personalInfo.fullName}
                  </h2>
                  {structuredResume.experience && structuredResume.experience[0]?.position && (
                    <p className="text-indigo-600 font-bold text-xs mt-0.5">
                      {structuredResume.experience[0].position}
                    </p>
                  )}
                  <p className="text-slate-600 text-[11px] mt-1">
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
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
                      Professional Summary
                    </h3>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {structuredResume.personalInfo.summary}
                    </p>
                  </div>
                )}

                {structuredResume.experience && structuredResume.experience.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {structuredResume.experience.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between font-bold text-xs text-slate-900">
                            <span>{exp.position}</span>
                            <span className="text-slate-500 font-normal">
                              {exp.startDate} - {exp.endDate || "Present"}
                            </span>
                          </div>
                          <p className="text-indigo-700 text-xs font-semibold">{exp.company}</p>
                          <p className="text-slate-600 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {structuredResume.skills && structuredResume.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
                      Skills
                    </h3>
                    <p className="text-slate-700 text-xs">
                      {structuredResume.skills.map((s) => s.name).join(", ")}
                    </p>
                  </div>
                )}

                {structuredResume.education && structuredResume.education.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
                      Education
                    </h3>
                    <div className="space-y-1.5">
                      {structuredResume.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-800">
                          <div>
                            <span className="font-bold text-slate-900">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                          </div>
                          <span className="text-slate-500">{edu.startDate} - {edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : resumeText ? (
              /* Raw Extracted Text View */
              <div className="font-mono text-xs whitespace-pre-wrap text-slate-800 leading-relaxed">
                {resumeText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No resume content available to preview.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
