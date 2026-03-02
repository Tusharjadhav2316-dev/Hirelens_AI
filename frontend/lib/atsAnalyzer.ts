import { Resume, Experience, Project, Education } from "@/types/resume";

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
    let keywordDensityScore = 100; // Placeholder for future use

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
        const weakVerbs = ["worked", "helped", "did", "assisted", "was responsible for"];
        let hasBulletPoints = false;
        let hasNumericValues = false;
        let weakVerbCount = 0;

        resume.experience.forEach((exp: Experience) => {
            const desc = exp.description || "";
            if (desc.includes("-") || desc.includes("•") || desc.includes("*") || /^\s*[-•*]/m.test(desc)) {
                hasBulletPoints = true;
            }
            if (/\d|%|\$|\+/.test(desc)) {
                hasNumericValues = true;
            }

            const lowerDesc = desc.toLowerCase();
            weakVerbs.forEach(verb => {
                const regex = new RegExp(`\\b${verb}\\b`, 'i');
                if (regex.test(lowerDesc)) {
                    weakVerbCount++;
                }
            });
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

    // 4. Projects Analysis
    if (resume.projects && resume.projects.length > 0) {
        resume.projects.forEach((proj: Project) => {
            if (!proj.githubUrl && !proj.liveUrl) {
                projectsScore -= 5;
                suggestions.push(`Consider adding a GitHub or live link to project "${proj.name || 'Unnamed'}".`);
            }
            // Projects form represents technologies as comma separated string or array. The UI may use an array or we might just check string.
            // As per type: technologies?: string[]
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
