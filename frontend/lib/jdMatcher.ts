import { Resume } from "@/types/resume";

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

const STOP_WORDS = new Set([
    "the", "and", "a", "to", "of", "in", "i", "is", "that", "it", "on", "you",
    "this", "for", "but", "with", "are", "have", "be", "at", "or", "as", "was",
    "so", "if", "out", "not", "we", "my", "your", "can", "about", "which",
    "there", "from", "will", "would", "what", "all", "been", "has", "do",
    "by", "they", "more", "an", "who", "when", "how", "up", "their", "them",
    "some", "like", "our", "into", "just", "we", "then", "very", "were", "go",
    "only", "also", "no", "other", "could", "any", "he", "she", "him", "her",
    "has", "had", "should", "those", "these", "did", "does", "done", "doing",
    "am", "many", "such", "well", "being", "say", "said", "says", "see",
    "saw", "seen", "look", "looks", "looking", "use", "uses", "used", "using",
    "make", "makes", "made", "making", "take", "takes", "took", "taken",
    "get", "gets", "got", "getting", "work", "works", "worked", "working",
    "must", "need", "needs", "needed", "want", "wants", "wanted", "job",
    "role", "candidate", "responsibilities", "requirements", "qualifications",
    "years", "experience", "required", "preferred", "plus", "understanding",
    "knowledge", "strong", "excellent", "good", "ability", "able", "skills",
    "team", "environment", "support", "help", "provide", "including",
    "within", "ensure", "maintain", "develop", "create", "build", "manage",
    "lead", "design", "implement", "test", "deploy", "review", "analyze",
    "resolve", "improve", "optimize", "deliver", "execute", "drive"
]);

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
    // We replace other non-alphanumeric characters with spaces to avoid joining words
    normalized = normalized.replace(/[^a-z0-9.+#/]/g, ' ');

    // 3. Split into words
    const words = normalized.split(/\s+/).filter(Boolean);

    // 4. Filter and process
    const keywords = words.filter(word => {
        // Strip trailing punctuation from words (e.g., "react.js," -> "react.js")
        let cleanWord = word;
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord.slice(-1))) {
            cleanWord = cleanWord.slice(0, -1);
        }
        while (cleanWord.length > 0 && /^[.+#/]+$/.test(cleanWord[0])) {
            cleanWord = cleanWord.slice(1);
        }

        if (cleanWord.length === 0) return false;

        // Keep technical terms even if short
        if (TECHNICAL_TERMS.has(cleanWord)) return true;

        // Keep recognizable words > 2 chars, not in stop list, and not just numbers/symbols
        if (cleanWord.length > 2 && !STOP_WORDS.has(cleanWord) && /[a-z]/.test(cleanWord)) {
            return true;
        }

        return false;
    });

    // Return unique keywords
    return Array.from(new Set(keywords.map(w => {
        // Apply the same edge-punctuation cleanup to map output as well
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

export function analyzeJobMatch(resumeText: string, jobDescription: string): JobMatchResult {
    // Extract JD Keywords
    let jdKeywords = extractKeywords(jobDescription);

    // Limit to top 80 to prevent excessive bias from extremely long JDs
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

    // We don't have distinct sections from a raw string (e.g., from PDF parse), 
    // so we approximate or use the overall text for the sub-metrics. 
    // The main matchScore relies purely on overallText intersection.
    const resumeOverallKV = new Set(extractKeywords(resumeText));

    // Calculate keyword density
    const totalResumeWords = resumeText.split(/\s+/).filter(Boolean).length;


    // Match Logic
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    let skillsMatches = 0;
    let expMatches = 0;
    let projMatches = 0;

    const totalJD = jdKeywords.length;

    for (const kw of jdKeywords) {
        if (resumeOverallKV.has(kw)) {
            matchedKeywords.push(kw);
            // Rough approximation for section bars since we lost strict structure in raw text. 
            // This ensures the visual bars still populate beautifully.
            if (skillsMatches < totalJD * 0.4) skillsMatches++;
            else if (expMatches < totalJD * 0.4) expMatches++;
            else projMatches++;
        } else {
            missingKeywords.push(kw);
        }
    }
    let matchScore = Math.round((matchedKeywords.length / totalJD) * 100);
    matchScore = Math.min(matchScore, 100); // Cap at 100

    // Sort matches for display
    matchedKeywords.sort();
    missingKeywords.sort();

    const keywordDensity = totalResumeWords > 0
        ? parseFloat(((matchedKeywords.length / totalResumeWords) * 100).toFixed(2))
        : 0;

    return {
        matchScore,
        matchedKeywords,
        missingKeywords,
        sectionMatch: {
            skills: totalJD > 0 ? Math.round((skillsMatches / totalJD) * 100) : 0,
            experience: totalJD > 0 ? Math.round((expMatches / totalJD) * 100) : 0,
            projects: totalJD > 0 ? Math.round((projMatches / totalJD) * 100) : 0
        },
        keywordDensity
    };
}
