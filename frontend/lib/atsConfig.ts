// ----------------------------------------------------------------------------
// CENTRALIZED ATS & RESUME QUALITY SCORING CONFIGURATION
// Single Source of Truth for all scoring weights, thresholds, and calibrators
// ----------------------------------------------------------------------------

export const ATS_SCORING_CONFIG = {
    // 1. Overall Category Weights
    qualityWeights: {
        formatting: 0.35,
        experience: 0.25,
        impact: 0.20,
        skills: 0.10,
        education: 0.10,
    },
    matchWeights: {
        keywords: 0.40,
        formatting: 0.25,
        experience: 0.20,
        education: 0.15,
        requiredSkillMultiplier: 3.0,
        preferredSkillMultiplier: 1.0,
    },

    // 2. Resume Quality Experience Clarity Weights (Max 100)
    qualityExperience: {
        typeMax: 40,
        workExperienceBase: 35,
        internshipBase: 22,
        freelanceBase: 20,
        researchBase: 20,
        projectsPartialMax: 18,
        projectsWithWorkBoost: 5,
        projectsWithInternshipBoost: 8,
        projectsOnlyBase: 18,

        durationMax: 25,
        duration5Plus: 25,
        duration3To5: 22,
        duration1To3: 17,
        durationUnder1: 10,

        quantificationMax: 15,
        quantificationEmployment: 15,
        quantificationProjectsOnly: 8,

        verbsMax: 10,
        weakVerbPenalty: 3,
        strongVerbBonus: 2,

        descriptionMax: 10,
        bulletsBonus: 5,
        wordCountHighBonus: 5,
        wordCountMediumBonus: 2,

        projectsOnlyCeiling: 48,
    },

    // 3. Calibrated ATS Match Experience Ranges (Max 100)
    matchExperience: {
        educationOnly: { base: 0, max: 5 },
        projectsOnly: { base: 15, max: 25 },
        strongProjectsQuantified: { base: 20, max: 35 },
        projectsLeadership: { base: 25, max: 40 },
        internship: { base: 40, max: 60 },
        professionalOneToTwoYears: { base: 60, max: 80 },
        professionalThreePlusYears: { base: 85, max: 100 },
    },

    // 4. Formatting Scoring Constants
    formatting: {
        baseScore: 100,
        lowWordCountThreshold: 500,
        lowWordCountDeduction: 30,
        highWordCountThreshold: 15000,
        highWordCountDeduction: 20,
        specialCharThresholdPercent: 0.05,
        specialCharDeduction: 15,
        uppercaseRatioThreshold: 0.10,
        uppercaseDeduction: 10,
        noBulletsDeduction: 20,
        noExperienceSectionDeduction: 20,
        noQuantificationDeduction: 15,
    },
};

// ----------------------------------------------------------------------------
// RECRUITING BOILERPLATE & STOP WORDS FILTER SETS
// Used to strip HR vocabulary, location words, and generic English words from missing keywords
// ----------------------------------------------------------------------------

export const RECRUITING_BOILERPLATE_WORDS = new Set([
    "position", "candidate", "ideal", "join", "role", "preferred", "responsibilities",
    "opportunity", "passionate", "looking", "seeking", "hiring", "apply", "qualifications",
    "requirements", "description", "duty", "duties", "accountabilities", "environment",
    "culture", "applicant", "applicants", "employment", "career", "salaries", "salary",
    "remuneration", "benefits", "perks", "opening", "openings", "vacancy", "vacancies",
    "status", "equal", "employer", "m/f/d", "gender", "race", "disability", "veteran",
    "regard", "notice", "period", "joining", "immediate", "urgent"
]);

export const LOCATION_AND_META_WORDS = new Set([
    "location", "locations", "city", "state", "country", "remote", "hybrid", "onsite",
    "office", "building", "street", "address", "years", "year", "yrs", "yr", "month",
    "months", "full-time", "part-time", "contract", "temporary", "permanent", "shift",
    "travel", "relocation", "visa", "sponsorship", "authorized"
]);

export const COMPANY_WORKPLACE_WORDS = new Set([
    "company", "organization", "team", "teams", "department", "firm", "business",
    "industry", "market", "client", "clients", "customer", "customers", "stakeholder",
    "stakeholders", "partner", "partners", "vendor", "vendors", "mission", "vision",
    "values", "goal", "goals", "workplace", "enterprise", "group"
]);

export const GENERAL_ENGLISH_STOPWORDS = new Set([
    "a", "about", "above", "across", "after", "again", "against", "all", "almost", "along",
    "already", "also", "although", "always", "among", "an", "and", "another", "any", "anyone",
    "anything", "are", "around", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing",
    "done", "down", "during", "each", "either", "enough", "etc", "even", "ever", "every",
    "everyone", "everything", "few", "for", "from", "further", "had", "has", "have", "having",
    "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "however", "i",
    "if", "in", "independently", "into", "is", "it", "its", "itself", "just", "least", "less",
    "let", "like", "likely", "many", "may", "me", "might", "more", "most", "much", "must",
    "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "one", "only",
    "or", "other", "others", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
    "should", "so", "some", "someone", "something", "still", "strong", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "upon", "us", "very", "was",
    "we", "well", "were", "what", "whatever", "when", "where", "which", "while", "who",
    "whom", "why", "will", "with", "within", "without", "would", "you", "your", "yours",
    "yourself", "experience", "required", "work", "working", "ability", "proven", "demonstrated",
    "track", "record", "knowledge", "understanding", "degree", "field", "related", "equivalent"
]);

// Combined master stop words set
export const MASTER_STOP_WORDS = new Set([
    ...Array.from(RECRUITING_BOILERPLATE_WORDS),
    ...Array.from(LOCATION_AND_META_WORDS),
    ...Array.from(COMPANY_WORKPLACE_WORDS),
    ...Array.from(GENERAL_ENGLISH_STOPWORDS)
]);

// ----------------------------------------------------------------------------
// KNOWN MULTI-WORD TECHNICAL PHRASES (BIGRAMS & TRIGRAMS)
// Preserved during keyword extraction
// ----------------------------------------------------------------------------

export const RECOGNIZED_TECHNICAL_PHRASES = [
    // Artificial Intelligence & Machine Learning
    "machine learning", "deep learning", "computer vision", "natural language processing",
    "generative ai", "large language models", "llm", "prompt engineering", "tensorflow lite",
    "google gemini api", "gemini api", "openai api", "pytorch", "hugging face", "scikit-learn",
    
    // Web & Application Development
    "spring boot", "react native", "react js", "next js", "node js", "express js",
    "vue js", "angular js", "tailwind css", "rest api", "restful api", "restful apis",
    "graphql api", "web socket", "websockets", "microservices architecture", "serverless architecture",
    
    // Computer Science & Architecture
    "data structures", "algorithms", "system design", "object oriented programming",
    "object-oriented programming", "oop", "software engineering", "design patterns",
    "clean architecture", "domain driven design",
    
    // Cloud, DevOps & Infrastructure
    "ci/cd", "continuous integration", "continuous deployment", "cloud computing",
    "amazon web services", "aws cloud", "google cloud platform", "gcp cloud",
    "microsoft azure", "azure cloud", "docker container", "kubernetes cluster",
    "terraform", "ansible", "infrastructure as code",
    
    // Databases & Testing
    "sql database", "nosql database", "postgresql", "mongodb", "redis cache",
    "unit testing", "integration testing", "test driven development", "tdd",
    "behavior driven development", "bdd", "end to end testing"
];
