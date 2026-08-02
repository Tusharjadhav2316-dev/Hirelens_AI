/**
 * Career Coach Service — Pure Helper Functions
 * Sprint 6, Day 1
 * All functions are pure (no side effects, no network calls, no Firebase).
 */

import { Resume } from "@/types/resume";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
}


export interface CareerCoachRequest {
    messages: ChatMessage[];
    resumeContext?: string;
    atsContext?: string;
    jobDescription?: string;
}

export interface ATSContextInput {
    overallScore: number;
    sectionScores: { summary: number; skills: number; experience: number; projects: number; education: number; };
    keywordDensityScore: number;
    impactScore: number;
    completenessScore: number;
    warnings: string[];
    suggestions: string[];
}

/**
 * Builds a curated plaintext summary of a Resume for the Career Coach context.
 * Includes ONLY non-empty resume sections to avoid emitting empty headings.
 * Truncates long descriptions to prevent token bloat.
 * Returns an empty string if the resume has no meaningful content.
 */
export function buildResumeContextBlock(resume: Resume): string {
    if (!resume || !hasResumeContent(resume)) return "";

    const lines: string[] = [];
    lines.push("=== CANDIDATE RESUME CONTEXT ===");
    lines.push("(This information comes from the candidate's HireLens resume — not from AI inference.)");
    lines.push("");

    const p = resume.personalInfo;
    const hasPersonalInfo = !!(p?.fullName || p?.summary || p?.location);
    if (hasPersonalInfo) {
        if (p.fullName) lines.push(`Name: ${p.fullName}`);
        if (p.summary) lines.push(`Summary: ${p.summary.substring(0, 300)}${p.summary.length > 300 ? "..." : ""}`);
        if (p.location) lines.push(`Location: ${p.location}`);
    }

    if (Array.isArray(resume.skills) && resume.skills.length > 0) {
        const skillNames = resume.skills.map(s => s.name).filter(Boolean).join(", ");
        if (skillNames) {
            lines.push(`\nSkills: ${skillNames.substring(0, 400)}`);
        }
    }

    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
        const activeExp = resume.experience.slice(0, 5);
        if (activeExp.length > 0) {
            lines.push("\nWork Experience:");
            for (const exp of activeExp) {
                lines.push(`  • ${exp.position || "Role"} at ${exp.company || "Company"} (${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""})`);
                if (exp.description) {
                    lines.push(`    ${exp.description.substring(0, 200)}${exp.description.length > 200 ? "..." : ""}`);
                }
            }
        }
    }

    if (Array.isArray(resume.education) && resume.education.length > 0) {
        lines.push("\nEducation:");
        for (const edu of resume.education) {
            lines.push(`  • ${edu.degree || ""} in ${edu.fieldOfStudy || ""} — ${edu.institution || ""} (${edu.startDate || ""} – ${edu.endDate || ""})`);
        }
    }

    if (Array.isArray(resume.projects) && resume.projects.length > 0) {
        const activeProjects = resume.projects.slice(0, 4);
        if (activeProjects.length > 0) {
            lines.push("\nProjects:");
            for (const proj of activeProjects) {
                const desc = proj.description ? `: ${proj.description.substring(0, 150)}${proj.description.length > 150 ? "..." : ""}` : "";
                lines.push(`  • ${proj.name || "Project"}${desc}`);
            }
        }
    }

    if (Array.isArray(resume.achievements) && resume.achievements.length > 0) {
        lines.push("\nAchievements:");
        for (const ach of resume.achievements) {
            if (ach.title) lines.push(`  • ${ach.title}`);
        }
    }

    if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
        lines.push("\nCertifications:");
        for (const cert of resume.certifications) {
            if (cert.name) {
                lines.push(`  • ${cert.name}${cert.issuer ? " (" + cert.issuer + ")" : ""}${cert.year ? ", " + cert.year : ""}`);
            }
        }
    }

    lines.push("\n=== END RESUME CONTEXT ===");
    return lines.join("\n");
}

/**
 * Produces a deterministic, human-readable summary of ATS analysis input.
 */
export function buildATSContextBlock(ats: ATSContextInput): string {
    if (!ats) return "";

    const lines: string[] = [];
    lines.push("=== HIRELENS ATS ANALYSIS (DETERMINISTIC ENGINE OUTPUT) ===");
    lines.push("(These scores were calculated by HireLens's deterministic ATS engine — not by AI estimation. Treat them as authoritative.)");
    lines.push("");
    lines.push(`Overall ATS Score: ${Math.round(ats.overallScore)}/100`);
    lines.push(`\nSection Scores:`);
    lines.push(`  • Summary: ${Math.round(ats.sectionScores.summary)}/100`);
    lines.push(`  • Experience: ${Math.round(ats.sectionScores.experience)}/100`);
    lines.push(`  • Skills: ${Math.round(ats.sectionScores.skills)}/100`);
    lines.push(`  • Projects: ${Math.round(ats.sectionScores.projects)}/100`);
    lines.push(`  • Education: ${Math.round(ats.sectionScores.education)}/100`);
    lines.push(`\nIntelligence Signals:`);
    lines.push(`  • Keyword Integration: ${Math.round(ats.keywordDensityScore)}/100`);
    lines.push(`  • Impact & Metrics: ${Math.round(ats.impactScore)}/100`);
    lines.push(`  • Profile Completeness: ${Math.round(ats.completenessScore)}/100`);

    if (Array.isArray(ats.warnings) && ats.warnings.length > 0) {
        lines.push(`\nWarnings: ${ats.warnings.slice(0, 3).join("; ")}`);
    }
    if (Array.isArray(ats.suggestions) && ats.suggestions.length > 0) {
        lines.push(`\nTop Suggestions: ${ats.suggestions.slice(0, 3).join("; ")}`);
    }

    lines.push("\n=== END ATS ANALYSIS ===");
    return lines.join("\n");
}

export function buildJDContextBlock(jobDescription: string): string {
    if (!jobDescription || jobDescription.trim().length < 20) return "";
    return [
        "=== TARGET JOB DESCRIPTION (provided by candidate) ===",
        "(Use this to answer questions about role fit — do not claim the candidate has skills not present in their resume.)",
        "",
        jobDescription.substring(0, 2000),
        "\n=== END JOB DESCRIPTION ===",
    ].join("\n");
}

/**
 * Pure function to trim conversation history to maxTurns * 2 messages.
 * Never mutates the input array.
 */
export function trimConversationHistory(messages: ChatMessage[], maxTurns: number = 8): ChatMessage[] {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    const maxMessages = maxTurns * 2;
    if (messages.length <= maxMessages) return [...messages];
    return messages.slice(messages.length - maxMessages);
}

/**
 * Inspects all 7 meaningful resume sections:
 * summary, experience, projects, education, skills, achievements, certifications.
 */
export function hasResumeContent(resume: Resume): boolean {
    if (!resume) return false;
    const p = resume.personalInfo;
    const hasSummary = !!(p?.summary && p.summary.trim().length > 0);
    const hasName = !!(p?.fullName && p.fullName.trim().length > 0);
    const hasExp = Array.isArray(resume.experience) && resume.experience.length > 0;
    const hasProj = Array.isArray(resume.projects) && resume.projects.length > 0;
    const hasEdu = Array.isArray(resume.education) && resume.education.length > 0;
    const hasSkills = Array.isArray(resume.skills) && resume.skills.length > 0;
    const hasAch = Array.isArray(resume.achievements) && resume.achievements.length > 0;
    const hasCert = Array.isArray(resume.certifications) && resume.certifications.length > 0;

    return hasName || hasSummary || hasExp || hasProj || hasEdu || hasSkills || hasAch || hasCert;
}
