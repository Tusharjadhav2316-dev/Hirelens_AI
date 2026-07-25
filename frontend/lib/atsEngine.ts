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

    // Additive bigram pass for compound technical terms (e.g. "machine learning")
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i + 1];

        if (
            w1.length >= 2 &&
            w2.length >= 2 &&
            !STOP_WORDS.has(w1) &&
            !STOP_WORDS.has(w2) &&
            isNaN(Number(w1)) &&
            isNaN(Number(w2))
        ) {
            keywordSet.add(`${w1} ${w2}`);
        }
    }

    return Array.from(keywordSet);
}

const NON_EMPLOYMENT_SECTION_HEADER_REGEX = /^\s*(?:education|academic\s+background|projects|academic\s+projects|personal\s+projects|skills|technical\s+skills|certifications|languages|awards|hobbies|references)\b/i;
const EMPLOYMENT_SECTION_HEADER_REGEX = /^\s*(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|experience|career\s+history|internship[s]?|internship\s+experience|freelance\s+experience|contract\s+work|consulting|research\s+experience|research\s+assistantship[s]?)\b/i;

function extractEmploymentText(resumeText: string): string {
    const lines = resumeText.split(/\r?\n/);
    let inEmploymentSection = false;
    let inNonEmploymentSection = false;
    const employmentLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (EMPLOYMENT_SECTION_HEADER_REGEX.test(trimmed)) {
            inEmploymentSection = true;
            inNonEmploymentSection = false;
            employmentLines.push(line);
            continue;
        }

        if (NON_EMPLOYMENT_SECTION_HEADER_REGEX.test(trimmed)) {
            inEmploymentSection = false;
            inNonEmploymentSection = true;
            continue;
        }

        if (inEmploymentSection) {
            employmentLines.push(line);
        } else if (!inNonEmploymentSection) {
            if (/\b(?:intern|internship|co-op|contractor|freelance|consultant|research\s+assistant)\b/i.test(trimmed)) {
                employmentLines.push(line);
            }
        }
    }

    return employmentLines.join("\n");
}

function extractYearsOfExperience(text: string): number {
    const employmentText = extractEmploymentText(text);
    const targetText = employmentText.trim().length > 0 ? employmentText : text;

    // If targetText has no employment section, return 0 to prevent education/project date inferences
    if (employmentText.trim().length === 0 && (NON_EMPLOYMENT_SECTION_HEADER_REGEX.test(text) || !/\b(?:work\s+experience|professional\s+experience|employment|intern|internship|freelance|contractor|consultant|research\s+assistant)\b/i.test(text))) {
        return 0;
    }

    const regex = /(\d+)(?:\+|(?:\s+to\s+|-)\d+)?\s*(?:years?|yrs?)/gi;
    let maxYears = 0;
    let match;

    while ((match = regex.exec(targetText)) !== null) {
        const years = parseInt(match[1], 10);
        if (years > maxYears) {
            maxYears = years;
        }
    }

    // Infer years of experience from 4-digit year ranges in employment text ONLY
    const yearRegex = /\b(20\d{2}|19\d{2})\b/g;
    const hasPresent = /\b(?:present|current|now|ongoing)\b/i.test(targetText);
    const yearMatches: number[] = [];
    let yearMatch;

    while ((yearMatch = yearRegex.exec(targetText)) !== null) {
        yearMatches.push(parseInt(yearMatch[1], 10));
    }

    if (hasPresent && yearMatches.length > 0) {
        yearMatches.push(new Date().getFullYear());
    }

    let inferredYears = 0;
    if (yearMatches.length >= 2) {
        const minYear = Math.min(...yearMatches);
        const maxYear = Math.max(...yearMatches);
        const diff = maxYear - minYear;
        inferredYears = Math.min(40, diff);
    }

    return Math.max(maxYears, inferredYears > 0 ? inferredYears : 0);
}

function calculateExperienceClarity(resumeText: string): number {
    const employmentText = extractEmploymentText(resumeText);

    // 1. Evaluate Experience Category Presence
    const hasInternship = /\b(?:intern|internship|internships|co-op|coop)\b/i.test(resumeText);
    const hasFreelance = /\b(?:freelance|freelancer|contractor|contract\s+work|consulting)\b/i.test(resumeText);
    const hasResearch = /\b(?:research\s+assistant|research\s+assistantship|graduate\s+researcher|lab\s+assistant)\b/i.test(resumeText);
    const hasProjects = /\b(?:projects|academic\s+projects|personal\s+projects|key\s+projects|selected\s+projects)\b/i.test(resumeText);

    // Check if the experience section contains ONLY internship roles (e.g. "Software Engineering Intern")
    const cleanedEmpText = (employmentText || resumeText).replace(/\b[A-Za-z\s]*(?:intern|internship|co-op|coop)\b/gi, "");
    const hasFullTimeRole = /\b(?:software\s+engineer|developer|manager|analyst|consultant|specialist|architect|engineer|administrator)\b/i.test(cleanedEmpText);
    const hasOnlyInternships = hasInternship && !hasFullTimeRole && !hasFreelance && !hasResearch;

    const hasWorkExperience = (/\b(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history)\b/i.test(resumeText) ||
        /\b(?:software\s+engineer|developer|manager|analyst|consultant|specialist|architect|engineer|administrator)\b/i.test(employmentText)) && !hasOnlyInternships;

    // --- Component 1: Experience Type & Breadth (Max 40 pts) ---
    let typeScore = 0;
    if (hasWorkExperience) {
        typeScore += 35;
    } else if (hasInternship) {
        typeScore += 22;
    } else if (hasFreelance) {
        typeScore += 20;
    } else if (hasResearch) {
        typeScore += 20;
    }

    if (hasProjects) {
        const projectBoost = hasWorkExperience ? 5 : (hasInternship || hasFreelance || hasResearch ? 8 : 18);
        typeScore += projectBoost;
    }
    typeScore = Math.min(40, typeScore);

    // --- Component 2: Duration & Timeline Depth (Max 25 pts) ---
    const years = extractYearsOfExperience(resumeText);
    let durationScore = 0;
    if (years >= 5) {
        durationScore = 25;
    } else if (years >= 3) {
        durationScore = 22;
    } else if (years >= 1) {
        durationScore = 17;
    } else if (hasWorkExperience || hasInternship || hasFreelance || hasResearch) {
        durationScore = 10;
    } else {
        durationScore = 0;
    }

    // --- Component 3: Achievement Quantification & Impact (Max 15 pts) ---
    let quantScore = 0;
    const hasEmpQuantification = detectQuantification(employmentText);
    const hasAnyQuantification = detectQuantification(resumeText);

    if (hasEmpQuantification && (hasWorkExperience || hasInternship || hasFreelance || hasResearch)) {
        quantScore = 15;
    } else if (hasAnyQuantification) {
        quantScore = 8;
    } else {
        quantScore = 0;
    }

    // --- Component 4: Action Verbs & Language Quality (Max 10 pts) ---
    let verbScore = 10;
    const weakVerbsList = countWeakVerbs(resumeText);
    verbScore -= Math.min(10, weakVerbsList.length * 3);

    const STRONG_VERBS = /\b(?:engineered|architected|spearheaded|optimized|managed|built|developed|designed|implemented|lead|led|orchestrated|automated|reduced|increased|scaled)\b/i;
    if (STRONG_VERBS.test(resumeText)) {
        verbScore = Math.min(10, verbScore + 2);
    }
    verbScore = Math.max(0, verbScore);

    // --- Component 5: Description Structure & Depth (Max 10 pts) ---
    let descScore = 0;
    const hasBullets = /•|-|\*/.test(resumeText);
    if (hasBullets) descScore += 5;

    const empWordCount = (employmentText || resumeText).split(/\s+/).filter(Boolean).length;
    if (empWordCount > 80) {
        descScore += 5;
    } else if (empWordCount > 30) {
        descScore += 2;
    }

    let finalExpScore = typeScore + durationScore + quantScore + verbScore + descScore;

    // Hard ceiling: Projects-only resumes can never reach >= 50 or 100
    if (!hasWorkExperience && !hasInternship && !hasFreelance && !hasResearch) {
        finalExpScore = Math.min(48, finalExpScore);
    }

    return Math.min(100, Math.max(0, Math.round(finalExpScore)));
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
    return /(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b(?:doubled|tripled|quadrupled)\b|\d+\s*(?:users|clients|revenue|dollars|projects|systems|teams|engineers|features|releases|services|applications))/i.test(text);
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
    const expScore = calculateExperienceClarity(resumeText);
    const weakVerbsList = countWeakVerbs(resumeText);

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

    if (finalScore > 95 && (missingKeywords.length > 0 || missingEducation || experienceGap)) {
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
            // Display cap only — does not affect final score calculation
            missingKeywords: missingKeywords.slice(0, 15),
            weakVerbs: weakVerbsList,
            noQuantification,
            lowWordCount,
            missingEducation,
            experienceGap
        }
    };
}

