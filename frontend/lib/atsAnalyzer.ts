import { Resume, Experience, Project, Education, Certification, Achievement } from "@/types/resume";
import { countWeakVerbs, detectQuantification } from "@/lib/atsEngine";

export interface ATSAnalysisResult {
    overallScore: number;
    sectionScores: {
        summary: number;
        skills: number;
        experience: number;
        projects: number;
        education: number;
    };
    warnings: string[];
    suggestions: string[];
    keywordDensityScore: number;
    impactScore: number;
    completenessScore: number;
}

function escapeRegexChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function skillAppearsInText(skillName: string, fullText: string): boolean {
    if (skillName.length <= 3) {
        const pattern = new RegExp('\\b' + escapeRegexChars(skillName) + '\\b', 'i');
        return pattern.test(fullText);
    }
    return fullText.includes(skillName);
}

export function analyzeResume(resume: Resume, isOverflowing: boolean = false): ATSAnalysisResult {
    let warnings: string[] = [];
    let suggestions: string[] = [];

    // Base scores that can be deducted from
    let summaryScore = 100;
    let experienceScore = 100;
    let skillsScore = 100;
    let projectsScore = 100;
    let educationScore = 100;

    // Overall modifiers
    let completenessScore = 100;
    let impactScore = 100;
    let keywordDensityScore = 100;

    // 1. Summary Analysis
    const summary = resume.personalInfo.summary || "";
    const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
    const hasNumbers = /\d/.test(summary);

    if (wordCount === 0) {
        summaryScore -= 20;
        warnings.push("Professional summary is missing.");
    } else if (wordCount < 20) {
        summaryScore -= 10;
        warnings.push("Professional summary is too short (under 20 words).");
        suggestions.push("Expand your summary to highlight key achievements and career goals (aim for 20-60 words).");
    } else if (wordCount > 60) {
        suggestions.push("Professional summary may be too long. Keep it concise (20-60 words).");
    }

    if (wordCount > 0 && !hasNumbers) {
        summaryScore -= 5;
        suggestions.push("Add metrics or years of experience (numbers) to your summary for more impact.");
    }

    // 2. Experience Analysis
    if (resume.experience.length === 0) {
        experienceScore -= 50;
        warnings.push("No work experience listed.");
    } else {
        let hasBulletPoints = false;
        let hasNumericValues = false;
        let weakVerbCount = 0;

        resume.experience.forEach((exp: Experience) => {
            const desc = exp.description || "";
            if (desc.includes("-") || desc.includes("•") || desc.includes("*") || /^\s*[-•*]/m.test(desc)) {
                hasBulletPoints = true;
            }
            if (detectQuantification(desc)) {
                hasNumericValues = true;
            }

            const expWeakVerbs = countWeakVerbs(desc);
            weakVerbCount += expWeakVerbs.length;
        });

        if (!hasBulletPoints) {
            experienceScore -= 15;
            warnings.push("Experience descriptions lack bullet points.");
            suggestions.push("Use bullet points in your experience section for better readability.");
        }

        if (!hasNumericValues) {
            experienceScore -= 15;
            impactScore -= 20;
            warnings.push("No numeric achievements found in experience.");
            suggestions.push("Quantify your achievements with numbers, percentages, or dollar amounts.");
        }

        if (weakVerbCount > 0) {
            experienceScore -= 5;
            impactScore -= 10;
            warnings.push(`Found ${weakVerbCount} weak action verb(s) like "worked" or "helped".`);
            suggestions.push("Replace weak verbs with strong action words (e.g., 'Spearheaded', 'Engineered', 'Orchestrated').");
        }
    }

    // 3. Skills Analysis
    const skills = resume.skills || [];
    if (skills.length < 5) {
        skillsScore -= 10;
        warnings.push(`Only ${skills.length} skill(s) listed.`);
        suggestions.push("Add at least 5 relevant skills to improve ATS keyword matching.");
    }

    const skillNames = skills.map(s => s.name.toLowerCase().trim());
    const uniqueSkills = new Set(skillNames);
    if (uniqueSkills.size < skillNames.length) {
        skillsScore -= 5;
        warnings.push("Duplicate skills detected.");
        suggestions.push("Remove duplicate skills and replace them with new relevant keywords.");
    }

    if (skills.length > 0) {
        const advancedSkillsCount = skills.filter(
            s => s.level === "Intermediate" || s.level === "Expert"
        ).length;
        if (advancedSkillsCount / skills.length < 0.5) {
            suggestions.push("Most of your skills are listed as Beginner. Consider highlighting more Intermediate or Expert-level skills relevant to your target roles.");
        }
    }

    // 4. Projects Analysis
    if (resume.projects && resume.projects.length > 0) {
        resume.projects.forEach((proj: Project) => {
            if (!proj.githubUrl && !proj.liveUrl) {
                projectsScore -= 5;
                suggestions.push(`Consider adding a GitHub or live link to project "${proj.name || 'Unnamed'}".`);
            }
            const techCount = proj.technologies?.length || 0;
            if (techCount === 0) {
                projectsScore -= 5;
                warnings.push(`No technologies listed for project "${proj.name || 'Unnamed'}".`);
            }
        });
    }

    // 5. Education Analysis
    if (resume.education.length === 0) {
        educationScore -= 20;
        warnings.push("No education details listed.");
    } else {
        resume.education.forEach((edu: Education) => {
            if (!edu.degree || !edu.institution) {
                educationScore -= 5;
                warnings.push("Missing degree or institution in education entries.");
            }
        });
    }

    // 5.5. Certifications & Achievements Analysis
    if (resume.certifications && resume.certifications.length > 0) {
        completenessScore = Math.min(100, completenessScore + 5);
        const hasMissingYear = resume.certifications.some((cert: Certification) => !cert.year || cert.year.trim() === "");
        if (hasMissingYear) {
            suggestions.push("Add the year to your certification entries to improve credibility.");
        }
    } else {
        suggestions.push("Consider adding relevant certifications to strengthen your ATS profile.");
    }

    if (resume.achievements && resume.achievements.length > 0) {
        impactScore = Math.min(100, impactScore + 5);
        const hasShortDesc = resume.achievements.some((ach: Achievement) => {
            const desc = (ach.description || "").trim();
            const wordCount = desc ? desc.split(/\s+/).length : 0;
            return wordCount < 20;
        });
        if (hasShortDesc) {
            suggestions.push("Expand your achievement descriptions with measurable impact and context.");
        }
    }

    // 6. Completeness Analysis
    if (!resume.personalInfo.linkedinUrl) {
        completenessScore -= 5;
        suggestions.push("Add a LinkedIn URL to your contact info.");
    }
    if (!resume.personalInfo.location) {
        completenessScore -= 3;
        suggestions.push("Add your location (City, State/Country) to your contact info.");
    }
    if (!resume.personalInfo.email || !resume.personalInfo.phone || !resume.personalInfo.fullName) {
        completenessScore -= 10;
        warnings.push("Missing critical contact information (Name, Email, or Phone).");
    }

    // Keyword Density Computation
    const summaryText = resume.personalInfo.summary || "";
    const expText = resume.experience ? resume.experience.map(e => e.description || "").join(" ") : "";
    const projText = resume.projects ? resume.projects.map(p => p.description || "").join(" ") : "";
    const fullText = `${summaryText} ${expText} ${projText}`.toLowerCase();

    const totalSkillCount = resume.skills ? resume.skills.length : 0;
    if (totalSkillCount > 0) {
        let matchedSkillCount = 0;
        resume.skills.forEach(skill => {
            const skillName = skill.name.toLowerCase().trim();
            if (skillName && skillAppearsInText(skillName, fullText)) {
                matchedSkillCount++;
            }
        });
        keywordDensityScore = Math.min(100, Math.round((matchedSkillCount / totalSkillCount) * 100));
    } else {
        keywordDensityScore = 50;
    }

    if (keywordDensityScore < 50) {
        suggestions.push("Many of your listed skills don't appear in your experience or project descriptions. Integrate them naturally to improve ATS keyword density.");
    }

    // Constraints check to ensure scores don't drop below 0
    summaryScore = Math.max(0, summaryScore);
    experienceScore = Math.max(0, experienceScore);
    skillsScore = Math.max(0, skillsScore);
    projectsScore = Math.max(0, projectsScore);
    educationScore = Math.max(0, educationScore);
    completenessScore = Math.max(0, completenessScore);
    impactScore = Math.max(0, impactScore);

    // 7. Overall Score Calculation
    // Weighted average: Experience(35%), Skills(20%), Summary(15%), Projects(15%), Education(15%)
    let rawScore =
        (experienceScore * 0.35) +
        (skillsScore * 0.20) +
        (summaryScore * 0.15) +
        (projectsScore * 0.15) +
        (educationScore * 0.15);

    // Apply completeness penalties
    const completenessPenalty = 100 - completenessScore;
    rawScore -= (completenessPenalty * 0.5); // Completeness affects overall

    // Single-page violation
    if (isOverflowing) {
        rawScore -= 20;
        warnings.push("Resume exceeds one page length.");
        suggestions.push("Shorten content to fit on a single page for strict ATS compliance.");
    }

    // Deduplicate warnings and suggestions
    warnings = [...new Set(warnings)];
    suggestions = [...new Set(suggestions)];

    let overallScore = Math.round(Number(Math.max(0, Math.min(100, rawScore))));

    if (overallScore < 0) overallScore = 0;
    if (overallScore > 100) overallScore = 100;

    return {
        overallScore,
        sectionScores: {
            summary: summaryScore,
            skills: skillsScore,
            experience: experienceScore,
            projects: projectsScore,
            education: educationScore
        },
        warnings,
        suggestions,
        keywordDensityScore,
        impactScore,
        completenessScore
    };
}

