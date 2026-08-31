"use client";

import React, { useState } from "react";
import { Resume, Project, Achievement, Certification, Education, Experience } from "@/types/resume";
import { ResumeArtifactData } from "@/types/agent";
import { FileText, Edit3, Download, Save, X, Check, Briefcase, GraduationCap, Code2, FolderGit2, Award, Mail, Phone, MapPin, Globe } from "lucide-react";

interface ResumePreviewCardProps {
    data: ResumeArtifactData | any;
    onSaveDraft?: (updatedResume: Resume) => void;
}

export default function ResumePreviewCard({ data, onSaveDraft }: ResumePreviewCardProps) {
    const initialResume: Resume = data?.resume || {
        id: "res-draft",
        title: "ATS-Optimized Resume",
        personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            summary: "",
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
    };

    const [resumeData, setResumeData] = useState<Resume>(initialResume);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<Resume>(initialResume);
    const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

    const handleStartEdit = () => {
        setEditForm(JSON.parse(JSON.stringify(resumeData)));
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        setResumeData(editForm);
        setIsEditing(false);
        if (onSaveDraft) {
            onSaveDraft(editForm);
        }
        setIsSavedNotice(true);
        setTimeout(() => setIsSavedNotice(false), 2500);
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const info = resumeData.personalInfo;
        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${info.fullName || "Resume"} - ATS Optimized Resume</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 20px; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 22px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .contact { font-size: 11px; color: #475569; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; margin-top: 16px; margin-bottom: 8px; padding-bottom: 3px; color: #0f172a; }
    p { font-size: 11px; margin: 4px 0; }
    ul { margin: 4px 0 10px 18px; padding: 0; }
    li { font-size: 11px; margin-bottom: 3px; }
    .job-head { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; }
    .job-sub { display: flex; justify-content: space-between; font-size: 11px; color: #475569; font-style: italic; margin-bottom: 4px; }
    .skills-list { font-size: 11px; }
  </style>
</head>
<body>
  <h1>${info.fullName || "Candidate Name"}</h1>
  <div class="contact">
    ${[info.email, info.phone, info.location, info.linkedinUrl, info.portfolioUrl].filter(Boolean).join(" | ")}
  </div>

  ${info.summary ? `<div class="section-title">Professional Summary</div><p>${info.summary}</p>` : ""}

  ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section-title">Work Experience</div>
    ${resumeData.experience.map(exp => `
      <div class="job-head">
        <span>${exp.position}</span>
        <span>${exp.company}</span>
      </div>
      <div class="job-sub">
        <span>${[exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" - ")}</span>
        <span>${(exp as any).location || ""}</span>
      </div>
      ${exp.description ? `<p style="font-size: 11px; margin: 2px 0;">${exp.description}</p>` : ""}
      ${((exp as any).bullets || []).length > 0 ? `
      <ul>
        ${((exp as any).bullets || []).map((b: string) => `<li>${b}</li>`).join("")}
      </ul>
      ` : ""}
    `).join("")}
  ` : ""}

  ${resumeData.projects && resumeData.projects.length > 0 ? `
    <div class="section-title">Projects</div>
    ${resumeData.projects.map(p => `
      <p style="margin-bottom: 6px;"><strong>${p.name}</strong> ${p.technologies?.length ? `(${p.technologies.join(", ")})` : ""}: ${p.description}</p>
    `).join("")}
  ` : ""}

  ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section-title">Education</div>
    ${resumeData.education.map(edu => `
      <div class="job-head">
        <span>${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
        <span>${edu.institution}</span>
      </div>
      <div class="job-sub">
        <span>${[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}</span>
        <span>${edu.gpa ? `GPA/Score: ${edu.gpa}` : ""}</span>
      </div>
    `).join("")}
  ` : ""}

  ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section-title">Technical Skills</div>
    <div class="skills-list">${resumeData.skills.map(s => s.name).join(" • ")}</div>
  ` : ""}

  ${resumeData.achievements && resumeData.achievements.length > 0 ? `
    <div class="section-title">Achievements & Leadership</div>
    <ul>
      ${resumeData.achievements.map(a => `<li><strong>${a.title}</strong>: ${a.description}</li>`).join("")}
    </ul>
  ` : ""}

  ${resumeData.certifications && resumeData.certifications.length > 0 ? `
    <div class="section-title">Certifications</div>
    <ul>
      ${resumeData.certifications.map(c => `<li><strong>${c.name}</strong> ${c.issuer ? `(${c.issuer})` : ""} ${c.year || ""}</li>`).join("")}
    </ul>
  ` : ""}

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const info = resumeData.personalInfo;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Structured ATS Resume Proposal
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Candidate Workspace Draft
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isSavedNotice && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Draft Saved
                        </span>
                    )}

                    {!isEditing ? (
                        <>
                            <button
                                onClick={handleStartEdit}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Resume</span>
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                            </button>

                            <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors shadow-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Document Body (Read-Only) */}
            {!isEditing ? (
                <div className="space-y-6 text-sm text-slate-800 dark:text-slate-200">
                    {/* Contact Info */}
                    <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {info.fullName || "Candidate Name"}
                        </h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            {info.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {info.email}</span>}
                            {info.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {info.phone}</span>}
                            {info.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {info.location}</span>}
                            {info.linkedinUrl && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {info.linkedinUrl}</span>}
                            {info.githubUrl && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {info.githubUrl}</span>}
                        </div>
                    </div>

                    {/* Summary */}
                    {info.summary && (
                        <div className="space-y-1.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Summary</h4>
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{info.summary}</p>
                        </div>
                    )}

                    {/* Work Experience */}
                    {resumeData.experience && resumeData.experience.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> Work Experience
                            </h4>
                            <div className="space-y-4">
                                {resumeData.experience.map((exp, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-slate-900 dark:text-white text-xs">{exp.position}</span>
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {[exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" - ")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            <span>{exp.company}</span>
                                            <span className="text-slate-400 font-normal">{(exp as any).location || ""}</span>
                                        </div>
                                        {exp.description && (
                                            <p className="text-xs text-slate-700 dark:text-slate-300">{exp.description}</p>
                                        )}
                                        {(exp as any).bullets && (exp as any).bullets.length > 0 && (
                                            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                                {((exp as any).bullets as string[]).map((b, i) => (
                                                    <li key={i}>{b}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects && resumeData.projects.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <FolderGit2 className="w-3.5 h-3.5" /> Projects
                            </h4>
                            <div className="space-y-3">
                                {resumeData.projects.map((proj, idx) => (
                                    <div key={idx} className="space-y-1 text-xs">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-slate-900 dark:text-white">{proj.name}</span>
                                            {proj.technologies && proj.technologies.length > 0 && (
                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                                    {proj.technologies.join(", ")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {resumeData.education && resumeData.education.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" /> Education
                            </h4>
                            <div className="space-y-2">
                                {resumeData.education.map((edu, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white">{edu.degree}</span>
                                            {edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                                            <span className="text-slate-500 dark:text-slate-400 block">{edu.institution}</span>
                                        </div>
                                        <div className="text-right text-slate-400">
                                            <span>{[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}</span>
                                            {edu.gpa && <span className="block text-[11px] text-slate-500 font-medium">{edu.gpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Skills */}
                    {resumeData.skills && resumeData.skills.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5" /> Technical Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {resumeData.skills.map((s, idx) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements & Leadership */}
                    {resumeData.achievements && resumeData.achievements.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" /> Achievements & Leadership
                            </h4>
                            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {resumeData.achievements.map((ach, idx) => (
                                    <li key={idx}>
                                        <strong className="text-slate-900 dark:text-white">{ach.title}</strong>
                                        {ach.description && ach.description !== ach.title && <span>: {ach.description}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications && resumeData.certifications.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" /> Certifications
                            </h4>
                            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {resumeData.certifications.map((cert, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold text-slate-900 dark:text-white">{cert.name}</span>
                                        {cert.issuer && <span className="text-slate-500"> — {cert.issuer}</span>}
                                        {cert.year && <span className="text-slate-400 font-normal"> ({cert.year})</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                /* Inline Multi-Section Editor Form */
                <div className="space-y-5 text-xs">
                    {/* Personal Info */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">Personal Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.personalInfo.fullName || ""}
                                    onChange={(e) => setEditForm({ ...editForm, personalInfo: { ...editForm.personalInfo, fullName: e.target.value } })}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                                <input
                                    type="text"
                                    value={editForm.personalInfo.email || ""}
                                    onChange={(e) => setEditForm({ ...editForm, personalInfo: { ...editForm.personalInfo, email: e.target.value } })}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editForm.personalInfo.phone || ""}
                                    onChange={(e) => setEditForm({ ...editForm, personalInfo: { ...editForm.personalInfo, phone: e.target.value } })}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                                <input
                                    type="text"
                                    value={editForm.personalInfo.location || ""}
                                    onChange={(e) => setEditForm({ ...editForm, personalInfo: { ...editForm.personalInfo, location: e.target.value } })}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Professional Summary</label>
                            <textarea
                                rows={3}
                                value={editForm.personalInfo.summary || ""}
                                onChange={(e) => setEditForm({ ...editForm, personalInfo: { ...editForm.personalInfo, summary: e.target.value } })}
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">Technical Skills (Comma Separated)</h4>
                        <input
                            type="text"
                            value={(editForm.skills || []).map(s => s.name).join(", ")}
                            onChange={(e) => {
                                const names = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                setEditForm({
                                    ...editForm,
                                    skills: names.map((name, i) => ({ id: `sk-${i}`, name, level: "Expert" as const }))
                                });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Certifications Editor */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">Certifications (One per line)</h4>
                        <textarea
                            rows={4}
                            value={(editForm.certifications || []).map(c => c.name).join("\n")}
                            onChange={(e) => {
                                const lines = e.target.value.split("\n").map(l => l.trim()).filter(Boolean);
                                setEditForm({
                                    ...editForm,
                                    certifications: lines.map((name, i) => ({ id: `cert-${i}`, name, issuer: "" }))
                                });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                        />
                    </div>

                    {/* Achievements Editor */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">Achievements & Leadership (One per line)</h4>
                        <textarea
                            rows={4}
                            value={(editForm.achievements || []).map(a => a.title).join("\n")}
                            onChange={(e) => {
                                const lines = e.target.value.split("\n").map(l => l.trim()).filter(Boolean);
                                setEditForm({
                                    ...editForm,
                                    achievements: lines.map((title, i) => ({ id: `ach-${i}`, title, description: title }))
                                });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
