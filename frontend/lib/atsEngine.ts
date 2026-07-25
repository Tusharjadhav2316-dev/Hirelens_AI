import {
    ATS_SCORING_CONFIG,
    MASTER_STOP_WORDS,
    RECOGNIZED_TECHNICAL_PHRASES
} from "./atsConfig";

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
    "assisted", "did", "made", "supported", "contributed to", "tried", "worked"
];

export function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-+#.]/g, " ").replace(/\s+/g, " ").trim();
}

// ----------------------------------------------------------------------------
// TECHNICAL KEYWORD EXTRACTION (Single words, Bigrams, Trigrams)
// Filters out recruiting boilerplate, HR words, and generic English stopwords
// ----------------------------------------------------------------------------
export function extractKeywords(text: string): string[] {
    const normalized = normalizeText(text);
    const words = normalized.split(/\s+/);
    const keywordSet = new Set<string>();

    // 1. Extract Recognized Multi-Word Technical Phrases (Bigrams & Trigrams)
    for (const phrase of RECOGNIZED_TECHNICAL_PHRASES) {
        const normPhrase = normalizeText(phrase);
        if (normalized.includes(normPhrase)) {
            keywordSet.add(normPhrase);
        }
    }

    // 2. Extract Valid Single-Word Technical Keywords
    for (const word of words) {
        const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
        if (
            cleanWord.length >= 2 &&
            !MASTER_STOP_WORDS.has(cleanWord) &&
            isNaN(Number(cleanWord))
        ) {
            keywordSet.add(cleanWord);
        }
    }

    // 3. Dynamic Bigram Extraction for Unrecognized Technical Pairs
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i].replace(/^[^\w]+|[^\w]+$/g, "");
        const w2 = words[i + 1].replace(/^[^\w]+|[^\w]+$/g, "");

        if (
            w1.length >= 2 &&
            w2.length >= 2 &&
            !MASTER_STOP_WORDS.has(w1) &&
            !MASTER_STOP_WORDS.has(w2) &&
            isNaN(Number(w1)) &&
            isNaN(Number(w2))
        ) {
            const bigram = `${w1} ${w2}`;
            // Avoid adding bigram if it contains generic stop words or boilerplate
            if (!MASTER_STOP_WORDS.has(bigram)) {
                keywordSet.add(bigram);
            }
        }
    }

    return Array.from(keywordSet);
}

// ----------------------------------------------------------------------------
// SECTION TIMELINE & EMPLOYMENT PARSING
// ----------------------------------------------------------------------------
const NON_EMPLOYMENT_SECTION_HEADER_REGEX = /^\s*(?:education|academic\s+background|projects|academic\s+projects|personal\s+projects|skills|technical\s+skills|certifications|languages|awards|hobbies|references)\b/i;
const EMPLOYMENT_SECTION_HEADER_REGEX = /^\s*(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|experience|career\s+history|internship[s]?|internship\s+experience|freelance\s+experience|contract\s+work|consulting|research\s+experience|research\s+assistantship[s]?)\b/i;

export function extractEmploymentText(resumeText: string): string {
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

export function extractYearsOfExperience(text: string): number {
    const employmentText = extractEmploymentText(text);
    const targetText = employmentText.trim().length > 0 ? employmentText : text;

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

// ----------------------------------------------------------------------------
// RESUME QUALITY: WEIGHTED QUALITY MODEL (Consumes ATS_SCORING_CONFIG)
// ----------------------------------------------------------------------------
export function calculateExperienceClarity(resumeText: string): number {
    const cfg = ATS_SCORING_CONFIG.qualityExperience;
    const employmentText = extractEmploymentText(resumeText);

    const hasInternship = /\b(?:intern|internship|internships|co-op|coop)\b/i.test(resumeText);
    const hasFreelance = /\b(?:freelance|freelancer|contractor|contract\s+work|consulting)\b/i.test(resumeText);
    const hasResearch = /\b(?:research\s+assistant|research\s+assistantship|graduate\s+researcher|lab\s+assistant)\b/i.test(resumeText);
    const hasProjects = /\b(?:projects|academic\s+projects|personal\s+projects|key\s+projects|selected\s+projects)\b/i.test(resumeText);

    const cleanedEmpText = (employmentText || resumeText).replace(/\b[A-Za-z\s]*(?:intern|internship|co-op|coop)\b/gi, "");
    const hasFullTimeRole = /\b(?:software\s+engineer|developer|manager|analyst|consultant|specialist|architect|engineer|administrator)\b/i.test(cleanedEmpText);
    const hasOnlyInternships = hasInternship && !hasFullTimeRole && !hasFreelance && !hasResearch;

    const hasWorkExperience = (/\b(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history)\b/i.test(resumeText) ||
        /\b(?:software\s+engineer|developer|manager|analyst|consultant|specialist|architect|engineer|administrator)\b/i.test(employmentText)) && !hasOnlyInternships;

    const hasLeadership = /\b(?:leadership|president|vice\s+president|lead|head|captain|chair|founder|co-founder)\b/i.test(resumeText);

    // Component 1: Type & Breadth
    let typeScore = 0;
    if (hasWorkExperience) {
        typeScore += cfg.workExperienceBase;
    } else if (hasInternship) {
        typeScore += cfg.internshipBase;
    } else if (hasFreelance) {
        typeScore += cfg.freelanceBase;
    } else if (hasResearch) {
        typeScore += cfg.researchBase;
    }

    if (hasProjects) {
        const projectBoost = hasWorkExperience ? cfg.projectsWithWorkBoost : (hasInternship || hasFreelance || hasResearch ? cfg.projectsWithInternshipBoost : cfg.projectsOnlyBase);
        typeScore += projectBoost;
    }
    if (hasLeadership && !hasWorkExperience) {
        typeScore += 5;
    }
    typeScore = Math.min(cfg.typeMax, typeScore);

    // Component 2: Duration
    const years = extractYearsOfExperience(resumeText);
    let durationScore = 0;
    if (years >= 5) {
        durationScore = cfg.duration5Plus;
    } else if (years >= 3) {
        durationScore = cfg.duration3To5;
    } else if (years >= 1) {
        durationScore = cfg.duration1To3;
    } else if (hasWorkExperience || hasInternship || hasFreelance || hasResearch) {
        durationScore = cfg.durationUnder1;
    } else {
        durationScore = 0;
    }

    // Component 3: Quantification
    let quantScore = 0;
    const hasEmpQuantification = detectQuantification(employmentText);
    const hasAnyQuantification = detectQuantification(resumeText);

    if (hasEmpQuantification && (hasWorkExperience || hasInternship || hasFreelance || hasResearch)) {
        quantScore = cfg.quantificationEmployment;
    } else if (hasAnyQuantification) {
        quantScore = cfg.quantificationProjectsOnly;
    } else {
        quantScore = 0;
    }

    // Component 4: Verbs & Language
    let verbScore = cfg.verbsMax;
    const weakVerbsList = countWeakVerbs(resumeText);
    verbScore -= Math.min(cfg.verbsMax, weakVerbsList.length * cfg.weakVerbPenalty);

    const STRONG_VERBS = /\b(?:engineered|architected|spearheaded|optimized|managed|built|developed|designed|implemented|lead|led|orchestrated|automated|reduced|increased|scaled)\b/i;
    if (STRONG_VERBS.test(resumeText)) {
        verbScore = Math.min(cfg.verbsMax, verbScore + cfg.strongVerbBonus);
    }
    verbScore = Math.max(0, verbScore);

    // Component 5: Description Depth
    let descScore = 0;
    const hasBullets = /•|-|\*/.test(resumeText);
    if (hasBullets) descScore += cfg.bulletsBonus;

    const empWordCount = (employmentText || resumeText).split(/\s+/).filter(Boolean).length;
    if (empWordCount > 80) {
        descScore += cfg.wordCountHighBonus;
    } else if (empWordCount > 30) {
        descScore += cfg.wordCountMediumBonus;
    }

    let finalExpScore = typeScore + durationScore + quantScore + verbScore + descScore;

    if (!hasWorkExperience && !hasInternship && !hasFreelance && !hasResearch) {
        finalExpScore = Math.min(cfg.projectsOnlyCeiling, finalExpScore);
    }

    return Math.min(100, Math.max(0, Math.round(finalExpScore)));
}

// ----------------------------------------------------------------------------
// ATS MATCH: CALIBRATED EXPERIENCE RELEVANCE SCORING
// Calibrated ranges: Education (0-5), Projects (15-25), Strong Projects + Impact (20-35),
// Projects + Leadership (25-40), Internship (40-60), Professional (60-100)
// ----------------------------------------------------------------------------
export function calculateATSExperienceScore(resumeText: string, jobDescription: string): { score: number; gap: boolean } {
    const cfg = ATS_SCORING_CONFIG.matchExperience;
    const employmentText = extractEmploymentText(resumeText);

    const hasWorkExperience = /\b(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history)\b/i.test(resumeText) ||
        (/\b(?:software\s+engineer|developer|manager|analyst|consultant|specialist|architect|engineer|administrator)\b/i.test(employmentText) && !/\b(?:intern|internship|project)\b/i.test(employmentText));

    const hasInternship = /\b(?:intern|internship|internships|co-op|coop)\b/i.test(resumeText);
    const hasFreelance = /\b(?:freelance|freelancer|contractor|contract\s+work|consulting)\b/i.test(resumeText);
    const hasResearch = /\b(?:research\s+assistant|research\s+assistantship|graduate\s+researcher|lab\s+assistant)\b/i.test(resumeText);
    const hasProjects = /\b(?:projects|academic\s+projects|personal\s+projects|key\s+projects|selected\s+projects)\b/i.test(resumeText);
    const hasLeadership = /\b(?:leadership|president|vice\s+president|lead|head|captain|chair|founder|co-founder)\b/i.test(resumeText);
    const hasQuant = detectQuantification(resumeText);

    const resumeYears = extractYearsOfExperience(resumeText);
    const jdYears = extractYearsOfExperience(jobDescription);

    let score = 0;
    let gap = false;

    // 1. Professional Employment Category
    if (hasWorkExperience) {
        let base = cfg.professionalOneToTwoYears.base; // 60
        if (resumeYears >= 3) {
            base = cfg.professionalThreePlusYears.base; // 85
        }
        
        let bonus = 0;
        if (jdYears > 0) {
            if (resumeYears >= jdYears) {
                bonus = 15;
            } else {
                bonus = Math.round((resumeYears / jdYears) * 10);
                gap = true;
            }
        } else {
            bonus = Math.min(15, resumeYears * 3);
        }

        if (hasQuant) bonus += 5;
        score = Math.min(100, base + bonus);
    }
    // 2. Internship Category
    else if (hasInternship || hasFreelance || hasResearch) {
        let base = cfg.internship.base; // 40
        let bonus = 0;
        if (hasProjects) bonus += 10;
        if (hasQuant) bonus += 5;
        if (resumeYears >= 1) bonus += 5;

        score = Math.min(cfg.internship.max, base + bonus); // Max 60
        if (jdYears > 0 && resumeYears < jdYears) gap = true;
    }
    // 3. Projects + Leadership Category
    else if (hasProjects && hasLeadership) {
        let base = cfg.projectsLeadership.base; // 25
        let bonus = 0;
        if (hasQuant) bonus += 10;
        bonus += 5; // Bullet detail

        score = Math.min(cfg.projectsLeadership.max, base + bonus); // Max 40
        if (jdYears > 0) gap = true;
    }
    // 4. Strong Projects + Quantified Impact Category
    else if (hasProjects && hasQuant) {
        let base = cfg.strongProjectsQuantified.base; // 20
        let bonus = 10;
        score = Math.min(cfg.strongProjectsQuantified.max, base + bonus); // Max 35
        if (jdYears > 0) gap = true;
    }
    // 5. Standard Projects Only Category
    else if (hasProjects) {
        let base = cfg.projectsOnly.base; // 15
        let bonus = 5; // Content present
        score = Math.min(cfg.projectsOnly.max, base + bonus); // Max 25
        if (jdYears > 0) gap = true;
    }
    // 6. Education Only Category
    else {
        score = cfg.educationOnly.base; // 0-5
        if (jdYears > 0) gap = true;
    }

    return { score: Math.round(score), gap };
}

// ----------------------------------------------------------------------------
// DETECTION HELPERS
// ----------------------------------------------------------------------------
export function detectEducation(text: string): boolean {
    const educationKeywords = ["bachelor", "master", "phd", "degree", "bs", "ba", "ms", "ma", "mba", "university", "college", "certification", "certified"];
    const normalized = normalizeText(text);
    return educationKeywords.some(kw => normalized.includes(kw));
}

export function detectSkillsSection(text: string): boolean {
    return /\b(?:skills|technologies|tools|competencies)\b/i.test(text);
}

export function detectExperienceSection(text: string): boolean {
    return /\b(?:experience|employment|work history)\b/i.test(text);
}

export function detectQuantification(text: string): boolean {
    return /(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b\d+[\d,.]*\+|\b(?:doubled|tripled|quadrupled)\b|\d+[\d,.]*\s*(?:\w+\s+){0,2}(?:users|clients|customers|revenue|dollars|projects|systems|teams|engineers|features|releases|services|applications|updates|requests|transactions|events|records|downloads|stars|workshops|members|students))/i.test(text);
}

export function countWeakVerbs(text: string): string[] {
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

    const cfg = ATS_SCORING_CONFIG.formatting;
    const weights = ATS_SCORING_CONFIG.qualityWeights;

    // 1. Formatting & Structure
    let formatScore = cfg.baseScore;
    const lowWordCount = resumeText.length < cfg.lowWordCountThreshold;

    if (lowWordCount) formatScore -= cfg.lowWordCountDeduction;
    if (resumeText.length > cfg.highWordCountThreshold) formatScore -= cfg.highWordCountDeduction;

    const specialCharCount = (resumeText.match(/[^\w\s.,-]/g) || []).length;
    if (specialCharCount > resumeText.length * cfg.specialCharThresholdPercent) formatScore -= cfg.specialCharDeduction;

    const upperCaseWords = (resumeText.match(/\b[A-Z]{4,}\b/g) || []).length;
    const totalWords = resumeText.split(/\s+/).length;
    if (totalWords > 0 && upperCaseWords / totalWords > cfg.uppercaseRatioThreshold) formatScore -= cfg.uppercaseDeduction;

    const noBulletPoints = !(/•|-|\*/.test(resumeText));
    if (noBulletPoints) formatScore -= cfg.noBulletsDeduction;

    if (!detectExperienceSection(resumeText)) formatScore -= cfg.noExperienceSectionDeduction;

    formatScore = Math.min(100, Math.max(0, formatScore));

    // 2. Experience Clarity
    const expScore = calculateExperienceClarity(resumeText);
    const weakVerbsList = countWeakVerbs(resumeText);

    // 3. Impact & Metrics
    let impactScore = 100;
    const noQuantification = !detectQuantification(resumeText);
    if (noQuantification) impactScore = 20;

    // 4. Skills Coverage
    let skillsScore = 100;
    if (!detectSkillsSection(resumeText)) skillsScore = 20;

    // 5. Education Presence
    let eduScore = 100;
    if (!detectEducation(resumeText)) eduScore = 20;

    let finalScore =
        (formatScore * weights.formatting) +
        (expScore * weights.experience) +
        (impactScore * weights.impact) +
        (skillsScore * weights.skills) +
        (eduScore * weights.education);

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
            missingKeywords: [],
            weakVerbs: weakVerbsList,
            noQuantification,
            lowWordCount,
            missingEducation: eduScore < 50,
            experienceGap: false
        }
    };
}

// ----------------------------------------------------------------------------
// MODE 2: ATS MATCH SCORE (JD REQUIRED) - WITH REQUIRED VS PREFERRED WEIGHTING
// ----------------------------------------------------------------------------
export function analyzeResumeMatch(resumeText: string, jobDescription: string): ATSResult {
    if (!jobDescription || jobDescription.trim().length === 0) {
        return {
            mode: "Match",
            finalScore: 0,
            breakdown: [],
            flags: { missingKeywords: [], weakVerbs: [], noQuantification: false, lowWordCount: false, missingEducation: false, experienceGap: false }
        };
    }

    const cfgFormat = ATS_SCORING_CONFIG.formatting;
    const weights = ATS_SCORING_CONFIG.matchWeights;

    // 1. Technical Keyword Extraction & Required vs Preferred Weighting
    const jdKeywords = extractKeywords(jobDescription);
    const resumeNorm = normalizeText(resumeText);

    // Identify required section keywords (if JD contains "Required" or "Requirements")
    const reqSectionMatch = jobDescription.match(/(?:required\s+skills|requirements|basic\s+qualifications|core\s+tech)([\s\S]*?)(?:preferred|nice\s+to\s+have|responsibilities|$)/i);
    const reqSectionText = reqSectionMatch ? reqSectionMatch[1] : "";
    const reqKeywordsSet = new Set(extractKeywords(reqSectionText));

    let matchedWeightedScore = 0;
    let maxWeightedScore = 0;
    const missingKeywords: string[] = [];

    for (const keyword of jdKeywords) {
        const isRequired = reqKeywordsSet.has(keyword);
        const weight = isRequired ? weights.requiredSkillMultiplier : weights.preferredSkillMultiplier;
        maxWeightedScore += weight;

        if (resumeNorm.includes(keyword)) {
            matchedWeightedScore += weight;
        } else {
            // Only add technical non-boilerplate keywords to missing list
            if (!MASTER_STOP_WORDS.has(keyword)) {
                missingKeywords.push(keyword);
            }
        }
    }

    let keywordScore = maxWeightedScore > 0 ? (matchedWeightedScore / maxWeightedScore) * 100 : 0;
    keywordScore = Math.min(100, Math.max(0, keywordScore));

    // 2. Formatting & Parseability
    let formatScore = cfgFormat.baseScore;
    const lowWordCount = resumeText.length < cfgFormat.lowWordCountThreshold;

    if (lowWordCount) formatScore -= cfgFormat.lowWordCountDeduction;
    if (resumeText.length > cfgFormat.highWordCountThreshold) formatScore -= cfgFormat.highWordCountDeduction;

    const specialCharCount = (resumeText.match(/[^\w\s.,-]/g) || []).length;
    if (specialCharCount > resumeText.length * cfgFormat.specialCharThresholdPercent) formatScore -= cfgFormat.specialCharDeduction;

    const upperCaseWords = (resumeText.match(/\b[A-Z]{4,}\b/g) || []).length;
    const totalWords = resumeText.split(/\s+/).length;
    if (totalWords > 0 && upperCaseWords / totalWords > cfgFormat.uppercaseRatioThreshold) formatScore -= cfgFormat.uppercaseDeduction;

    const noBulletPoints = !(/•|-|\*/.test(resumeText));
    if (noBulletPoints) formatScore -= cfgFormat.noBulletsDeduction;

    const noQuantification = !detectQuantification(resumeText);
    if (noQuantification) formatScore -= cfgFormat.noQuantificationDeduction;

    formatScore = Math.min(100, Math.max(0, formatScore));

    // 3. Calibrated Experience Relevance
    const { score: experienceScore, gap: experienceGap } = calculateATSExperienceScore(resumeText, jobDescription);

    // 4. Education & Certifications
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
        (keywordScore * weights.keywords) +
        (formatScore * weights.formatting) +
        (experienceScore * weights.experience) +
        (educationScore * weights.education);

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
            missingKeywords: missingKeywords.slice(0, 15),
            weakVerbs: weakVerbsList,
            noQuantification,
            lowWordCount,
            missingEducation,
            experienceGap
        }
    };
}
