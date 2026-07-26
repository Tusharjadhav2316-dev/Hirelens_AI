import { Resume } from "@/types/resume";
import { MASTER_STOP_WORDS } from "@/lib/atsConfig";

export interface JobMatchResult {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    sectionMatch: {
        skills: number;
        experience: number;
        projects: number;
    };
    keywordDensity: number;
}

// Preserve compound technical terms that might otherwise be split or removed
const TECHNICAL_TERMS = new Set([
    "c++", "c#", "f#", "node.js", "next.js", "react.js", "vue.js", "nest.js",
    "ci/cd", "tcp/ip", "ui/ux", "ar/vr", "pl/sql", "ts/js", "a/b", "p2p",
    "b2b", "b2c", "saas", "paas", "iaas", "aws", "gcp", "azure", "docker",
    "kubernetes", "k8s", "ai", "ml", "nlp", "llm", "api", "rest", "graphql",
    "sql", "nosql", "html", "css", "js", "ts", "php", "go", "rust", "java",
    "python", "ruby", "perl", "bash", "shell", "git", "svn", "jira",
    "agile", "scrum", "kanban", "devops", "mlops", "secops", "linux",
    "windows", "macos", "unix", "ubuntu", "centos", "debian", "redhat",
    "mysql", "postgresql", "oracle", "mongodb", "redis", "cassandra",
    "elasticsearch", "solr", "kafka", "rabbitmq", "spark", "hadoop",
    "spring", "django", "flask", "express", "laravel", "rails", "asp.net",
    "angular", "svelte", "bootstrap", "tailwind", "mui", "grpc", "soap",
    "oauth", "saml", "jwt", "ssl", "tls", "https", "dns", "dhcp", "vpn"
]);

function extractKeywords(text: string): string[] {
    if (!text) return [];

    // 1. Lowercase
    let normalized = text.toLowerCase();

    // 2. Remove punctuation except . + # / (to preserve things like C++, C#, .NET, Node.js, CI/CD)
    normalized = normalized.replace(/[^a-z0-9.+#/]/g, ' ');

    // 3. Split into words
    const words = normalized.split(/\s+/).filter(Boolean);

    // 4. Filter and process
    const keywords = words.filter(word => {
        let cleanWord = word;
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord.slice(-1))) {
            cleanWord = cleanWord.slice(0, -1);
        }
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord[0])) {
            cleanWord = cleanWord.slice(1);
        }

        if (cleanWord.length === 0) return false;

        if (TECHNICAL_TERMS.has(cleanWord)) return true;

        if (cleanWord.length > 2 && !MASTER_STOP_WORDS.has(cleanWord) && /[a-z]/.test(cleanWord)) {
            return true;
        }

        return false;
    });

    return Array.from(new Set(keywords.map(w => {
        let cleanWord = w;
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord.slice(-1))) {
            cleanWord = cleanWord.slice(0, -1);
        }
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord[0])) {
            cleanWord = cleanWord.slice(1);
        }
        return cleanWord;
    }).filter(Boolean)));
}

export function formatResumeToText(resume: Resume): string {
    const skillsText = resume.skills.map(s => `${s.name} ${s.level}`).join(" ");
    const expText = resume.experience.map(e => `${e.position} ${e.company} ${e.description}`).join(" ");
    const projText = resume.projects.map(p => `${p.name} ${(p.technologies || []).join(" ")} ${p.description}`).join(" ");
    return `${skillsText} ${expText} ${projText} ${resume.personalInfo.summary}`;
}

function splitJDByRequirement(jd: string): { required: string; preferred: string } {
    const lowerJD = jd.toLowerCase();
    const patterns = [
        "preferred qualifications",
        "preferred skills",
        "nice to have",
        "bonus",
        "desirable",
        "it's a plus",
        "what you'll bring"
    ];

    let matchIndex = -1;
    for (const pattern of patterns) {
        const index = lowerJD.indexOf(pattern);
        if (index !== -1) {
            if (matchIndex === -1 || index < matchIndex) {
                matchIndex = index;
            }
        }
    }

    if (matchIndex !== -1) {
        return {
            required: jd.substring(0, matchIndex),
            preferred: jd.substring(matchIndex)
        };
    }

    return {
        required: jd,
        preferred: ""
    };
}

export function analyzeJobMatch(resumeText: string, jobDescription: string, resume?: Resume): JobMatchResult {
    // Split JD into required vs. preferred sections to assign keyword weights
    const { required, preferred } = splitJDByRequirement(jobDescription);
    const requiredKeywords = extractKeywords(required);
    const preferredKeywords = extractKeywords(preferred);

    const keywordWeights = new Map<string, number>();
    requiredKeywords.forEach(kw => keywordWeights.set(kw, 1.0));
    preferredKeywords.forEach(kw => {
        if (!keywordWeights.has(kw)) {
            keywordWeights.set(kw, 0.5);
        }
    });

    const allJdKeywords = Array.from(keywordWeights.keys());

    // Build frequency map from raw job description tokens to prioritize most frequent keywords
    const rawTokens = jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9.+#/]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const freqMap = new Map<string, number>();
    rawTokens.forEach(token => {
        let cleanWord = token;
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord.slice(-1))) {
            cleanWord = cleanWord.slice(0, -1);
        }
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord[0])) {
            cleanWord = cleanWord.slice(1);
        }
        if (cleanWord) {
            freqMap.set(cleanWord, (freqMap.get(cleanWord) || 0) + 1);
        }
    });

    allJdKeywords.sort((a, b) => (freqMap.get(b) || 0) - (freqMap.get(a) || 0));

    let jdKeywords = allJdKeywords;
    if (jdKeywords.length > 80) {
        jdKeywords = jdKeywords.slice(0, 80);
    }

    if (jdKeywords.length === 0) {
        return {
            matchScore: 0,
            matchedKeywords: [],
            missingKeywords: [],
            sectionMatch: { skills: 0, experience: 0, projects: 0 },
            keywordDensity: 0
        };
    }

    const resumeOverallKV = new Set(extractKeywords(resumeText));
    const totalResumeWords = resumeText.split(/\s+/).filter(Boolean).length;

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    let weightedMatch = 0;
    let totalWeight = 0;

    let skillsMatchesFallback = 0;
    let expMatchesFallback = 0;
    let projMatchesFallback = 0;
    const totalJD = jdKeywords.length;

    for (const kw of jdKeywords) {
        const weight = keywordWeights.get(kw) || 1.0;
        totalWeight += weight;

        if (resumeOverallKV.has(kw)) {
            matchedKeywords.push(kw);
            weightedMatch += weight;

            if (skillsMatchesFallback < totalJD * 0.4) skillsMatchesFallback++;
            else if (expMatchesFallback < totalJD * 0.4) expMatchesFallback++;
            else projMatchesFallback++;
        } else {
            missingKeywords.push(kw);
        }
    }

    const weightedScore = totalWeight > 0 ? Math.round((weightedMatch / totalWeight) * 100) : 0;
    const matchScore = Math.min(100, weightedScore);

    // Sort matches for display
    matchedKeywords.sort();
    missingKeywords.sort();

    const keywordDensity = totalResumeWords > 0
        ? parseFloat(((matchedKeywords.length / totalResumeWords) * 100).toFixed(2))
        : 0;

    let sectionMatch: { skills: number; experience: number; projects: number };

    if (resume) {
        const jdSet = new Set(jdKeywords);

        // Skills section match
        const skillsCount = resume.skills ? resume.skills.length : 0;
        let matchedSkillCount = 0;
        if (skillsCount > 0) {
            resume.skills.forEach(s => {
                const name = s.name.toLowerCase().trim();
                if (name && jdSet.has(name)) {
                    matchedSkillCount++;
                }
            });
        }
        const skillsScore = Math.round((matchedSkillCount / Math.max(1, skillsCount)) * 100);

        // Experience section match
        const expText = resume.experience ? resume.experience.map(e => e.description || "").join(" ") : "";
        const expKeywords = extractKeywords(expText);
        const expMatchedCount = expKeywords.filter(kw => jdSet.has(kw)).length;
        const experienceScore = expKeywords.length > 0 ? Math.round((expMatchedCount / expKeywords.length) * 100) : 0;

        // Projects section match
        const projText = resume.projects ? resume.projects.map(p => p.description || "").join(" ") : "";
        const projKeywords = extractKeywords(projText);
        const projMatchedCount = projKeywords.filter(kw => jdSet.has(kw)).length;
        const projectsScore = projKeywords.length > 0 ? Math.round((projMatchedCount / projKeywords.length) * 100) : 0;

        sectionMatch = {
            skills: skillsScore,
            experience: experienceScore,
            projects: projectsScore
        };
    } else {
        sectionMatch = {
            skills: totalJD > 0 ? Math.round((skillsMatchesFallback / totalJD) * 100) : 0,
            experience: totalJD > 0 ? Math.round((expMatchesFallback / totalJD) * 100) : 0,
            projects: totalJD > 0 ? Math.round((projMatchesFallback / totalJD) * 100) : 0
        };
    }

    return {
        matchScore,
        matchedKeywords,
        missingKeywords,
        sectionMatch,
        keywordDensity
    };
}

