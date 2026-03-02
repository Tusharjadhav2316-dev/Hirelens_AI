export interface ATSBreakdownItem {
    label: string;
    weight: string;
    score: number;
}

export interface ATSFlags {
    missingKeywords: string[];
    weakVerbs: string[];
    noQuantification: boolean;
    lowWordCount: boolean;
    missingEducation: boolean;
    experienceGap: boolean;
}

export interface ATSResult {
    mode: "Quality" | "Match";
    finalScore: number;
    breakdown: ATSBreakdownItem[];
    flags: ATSFlags;
}

const WEAK_VERBS = [
    "helped", "handled", "worked on", "responsible for", "participated in",
    "assisted", "did", "made", "supported", "contributed to", "tried"
];

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it",
    "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these",
    "they", "this", "to", "was", "will", "with", "experience", "looking", "seeking", "required"
]);

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(text: string): string[] {
    const normalized = normalizeText(text);
    const words = normalized.split(" ");
    const keywordSet = new Set<string>();

    for (const word of words) {
        if (word.length > 3 && !STOP_WORDS.has(word) && isNaN(Number(word))) {
            keywordSet.add(word);
        }
    }
    return Array.from(keywordSet);
}

function extractYearsOfExperience(text: string): number {
    const regex = /(\d+)(?:\+|(?:\s+to\s+|-)\d+)?\s*(?:years?|yrs?)/gi;
    let maxYears = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const years = parseInt(match[1], 10);
        if (years > maxYears) {
            maxYears = years;
        }
    }
    return maxYears;
}

function detectEducation(text: string): boolean {
    const educationKeywords = ["bachelor", "master", "phd", "degree", "bs", "ba", "ms", "ma", "mba", "university", "college", "certification", "certified"];
    const normalized = normalizeText(text);
    return educationKeywords.some(kw => normalized.includes(kw));
}

function detectSkillsSection(text: string): boolean {
    return /\b(?:skills|technologies|tools|competencies)\b/i.test(text);
}

function detectExperienceSection(text: string): boolean {
    return /\b(?:experience|employment|work history)\b/i.test(text);
}

function detectQuantification(text: string): boolean {
    return /\d+%|\d+\s*(?:users|clients|revenue|dollars|$|%|metrics)/i.test(text);
}

function countWeakVerbs(text: string): string[] {
    const normalized = normalizeText(text);
    const flags: string[] = [];
    for (const verb of WEAK_VERBS) {
        if (normalized.includes(verb)) {
            flags.push(verb);
        }
    }
    return flags;
}

// ----------------------------------------------------------------------------
// MODE 1: RESUME QUALITY SCORE (NO JD REQUIRED)
// ----------------------------------------------------------------------------
export function analyzeResumeQuality(resumeText: string): ATSResult {
    if (!resumeText || resumeText.trim().length === 0) {
        return {
            mode: "Quality",
            finalScore: 0,
            breakdown: [],
            flags: { missingKeywords: [], weakVerbs: [], noQuantification: false, lowWordCount: false, missingEducation: false, experienceGap: false }
        };
    }

    // 1. Formatting & Structure (35%)
    let formatScore = 100;
    const lowWordCount = resumeText.length < 500;

    if (lowWordCount) formatScore -= 30; // Too short
    if (resumeText.length > 15000) formatScore -= 20; // Too long

    const specialCharCount = (resumeText.match(/[^\w\s.,-]/g) || []).length;
    if (specialCharCount > resumeText.length * 0.05) formatScore -= 15;

    const upperCaseWords = (resumeText.match(/\b[A-Z]{4,}\b/g) || []).length;
    const totalWords = resumeText.split(/\s+/).length;
    if (totalWords > 0 && upperCaseWords / totalWords > 0.1) formatScore -= 10;

    const noBulletPoints = !(/•|-|\*/.test(resumeText));
    if (noBulletPoints) formatScore -= 20;

    if (!detectExperienceSection(resumeText)) formatScore -= 20;

    formatScore = Math.min(100, Math.max(0, formatScore));

    // 2. Experience Clarity (25%)
    let expScore = 100;
    const weakVerbsList = countWeakVerbs(resumeText);
    if (weakVerbsList.length > 0) expScore -= (weakVerbsList.length * 10);
    const resumeYears = extractYearsOfExperience(resumeText);
    if (resumeYears === 0) expScore -= 30; // Couldn't dynamically extract timelines
    expScore = Math.min(100, Math.max(0, expScore));

    // 3. Impact & Metrics (20%)
    let impactScore = 100;
    const noQuantification = !detectQuantification(resumeText);
    if (noQuantification) impactScore = 20; // Very difficult to show metric impact without numbers

    // 4. Skills Coverage (10%)
    let skillsScore = 100;
    if (!detectSkillsSection(resumeText)) skillsScore = 20;

    // 5. Education Presence (10%)
    let eduScore = 100;
    if (!detectEducation(resumeText)) eduScore = 20;

    let finalScore =
        (formatScore * 0.35) +
        (expScore * 0.25) +
        (impactScore * 0.20) +
        (skillsScore * 0.10) +
        (eduScore * 0.10);

    return {
        mode: "Quality",
        finalScore: Math.round(finalScore),
        breakdown: [
            { label: "Formatting & Structure", weight: "35%", score: Math.round(formatScore) },
            { label: "Experience Clarity", weight: "25%", score: Math.round(expScore) },
            { label: "Impact & Metrics", weight: "20%", score: Math.round(impactScore) },
            { label: "Skills Coverage", weight: "10%", score: Math.round(skillsScore) },
            { label: "Education Presence", weight: "10%", score: Math.round(eduScore) }
        ],
        flags: {
            missingKeywords: [], // N/A in quality mode
            weakVerbs: weakVerbsList,
            noQuantification,
            lowWordCount,
            missingEducation: eduScore < 50,
            experienceGap: false // N/A without a JD
        }
    };
}

// ----------------------------------------------------------------------------
// MODE 2: ATS MATCH SCORE (JD REQUIRED)
// ----------------------------------------------------------------------------
export function analyzeResumeMatch(resumeText: string, jobDescription: string): ATSResult {
    // If JD is empty, return null/0 indicating invalid state for this mode
    if (!jobDescription || jobDescription.trim().length === 0) {
        return {
            mode: "Match",
            finalScore: 0,
            breakdown: [],
            flags: { missingKeywords: [], weakVerbs: [], noQuantification: false, lowWordCount: false, missingEducation: false, experienceGap: false }
        };
    }

    // 1. Keyword Match (40%)
    const jdKeywords = extractKeywords(jobDescription);
    const resumeNorm = normalizeText(resumeText);

    let matchedCount = 0;
    const missingKeywords: string[] = [];

    for (const keyword of jdKeywords) {
        if (resumeNorm.includes(keyword)) {
            matchedCount++;
        } else {
            missingKeywords.push(keyword);
        }
    }

    let keywordScore = jdKeywords.length > 0 ? (matchedCount / jdKeywords.length) * 100 : 0;
    keywordScore = Math.min(100, Math.max(0, keywordScore));

    // 2. Formatting & Parseability (25%)
    let formatScore = 100;
    const lowWordCount = resumeText.length < 500;

    if (lowWordCount) formatScore -= 30;
    if (resumeText.length > 15000) formatScore -= 20;

    const specialCharCount = (resumeText.match(/[^\w\s.,-]/g) || []).length;
    if (specialCharCount > resumeText.length * 0.05) formatScore -= 15;

    const upperCaseWords = (resumeText.match(/\b[A-Z]{4,}\b/g) || []).length;
    const totalWords = resumeText.split(/\s+/).length;
    if (totalWords > 0 && upperCaseWords / totalWords > 0.1) formatScore -= 10;

    const noBulletPoints = !(/•|-|\*/.test(resumeText));
    if (noBulletPoints) formatScore -= 20;

    const noQuantification = !detectQuantification(resumeText);
    if (noQuantification) formatScore -= 15;

    formatScore = Math.min(100, Math.max(0, formatScore));

    // 3. Experience Relevance (20%)
    const jdYears = extractYearsOfExperience(jobDescription);
    const resumeYears = extractYearsOfExperience(resumeText);

    let experienceScore = 0;
    let experienceGap = false;

    if (jdYears > 0) {
        if (resumeYears >= jdYears) {
            experienceScore = 100;
        } else if (resumeYears > 0) {
            experienceScore = Math.round((resumeYears / jdYears) * 80);
            experienceGap = true;
        } else {
            experienceScore = 0;
            experienceGap = true;
        }
    } else {
        experienceScore = resumeYears > 0 ? 100 : 50;
    }

    // 4. Education & Certifications (15%)
    let educationScore = 10;
    let missingEducation = false;

    const jdNeedsEdu = detectEducation(jobDescription);
    const resumeHasEdu = detectEducation(resumeText);

    if (jdNeedsEdu) {
        if (resumeHasEdu) {
            educationScore = 100;
        } else {
            educationScore = 0;
            missingEducation = true;
        }
    } else if (resumeHasEdu) {
        educationScore = 100;
    }

    const weakVerbsList = countWeakVerbs(resumeText);

    let finalScore =
        (keywordScore * 0.40) +
        (formatScore * 0.25) +
        (experienceScore * 0.20) +
        (educationScore * 0.15);

    if (finalScore < 35 && resumeText.trim().length > 0) {
        finalScore = 35;
    } else if (finalScore > 95 && (missingKeywords.length > 0 || missingEducation || experienceGap)) {
        finalScore = Math.min(finalScore, 95);
    }

    return {
        mode: "Match",
        finalScore: Math.round(finalScore),
        breakdown: [
            { label: "Keyword Match", weight: "40%", score: Math.round(keywordScore) },
            { label: "Formatting", weight: "25%", score: Math.round(formatScore) },
            { label: "Experience", weight: "20%", score: Math.round(experienceScore) },
            { label: "Education", weight: "15%", score: Math.round(educationScore) }
        ],
        flags: {
            missingKeywords: missingKeywords.slice(0, 15),
            weakVerbs: weakVerbsList,
            noQuantification,
            lowWordCount,
            missingEducation,
            experienceGap
        }
    };
}
