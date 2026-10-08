import { MASTER_STOP_WORDS } from "./atsConfig";

// ----------------------------------------------------------------------------
// CANONICAL KEYWORD & PHRASE DICTIONARY
// Maps normalized string variants to standard human-readable display terms
// ----------------------------------------------------------------------------
export const CANONICAL_TERMS_MAP: Record<string, string> = {
  // Frontend & UI
  "react": "React",
  "react.js": "React",
  "reactjs": "React",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "next.js app router": "App Router",
  "app router": "App Router",
  "vue": "Vue.js",
  "vue.js": "Vue.js",
  "vuejs": "Vue.js",
  "angular": "Angular",
  "angular.js": "Angular",
  "angularjs": "Angular",
  "svelte": "Svelte",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "tailwind": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "core web vitals": "Core Web Vitals",
  "web vitals": "Core Web Vitals",
  "wcag": "WCAG Accessibility",
  "accessibility": "Accessibility",
  "a11y": "Accessibility",
  "seo": "SEO Optimization",
  "redux": "Redux Toolkit",
  "redux toolkit": "Redux Toolkit",
  "react query": "React Query",
  "tanstack query": "React Query",
  "zustand": "Zustand",
  "state management": "State Management",
  "responsive design": "Responsive Design",

  // Backend, APIs & Systems
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "node": "Node.js",
  "express": "Express.js",
  "express.js": "Express.js",
  "nestjs": "NestJS",
  "nest.js": "NestJS",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "spring boot": "Spring Boot",
  "graphql": "GraphQL",
  "graphql api": "GraphQL",
  "graphql apis": "GraphQL",
  "rest api": "REST API",
  "rest apis": "REST API",
  "restful api": "REST API",
  "restful apis": "REST API",
  "rest": "REST API",
  "grpc": "gRPC",
  "websockets": "WebSockets",
  "microservices": "Microservices",
  "microservices architecture": "Microservices",
  "serverless": "Serverless",
  "system design": "System Design",
  "data structures": "Data Structures",
  "algorithms": "Algorithms",

  // Databases & Caching
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mongodb": "MongoDB",
  "redis": "Redis",
  "mysql": "MySQL",
  "sqlite": "SQLite",
  "sql": "SQL",
  "nosql": "NoSQL",
  "snowflake": "Snowflake",
  "bigquery": "BigQuery",

  // Cloud & DevOps
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud (GCP)",
  "google cloud": "Google Cloud (GCP)",
  "google cloud platform": "Google Cloud (GCP)",
  "azure": "Microsoft Azure",
  "docker": "Docker",
  "docker container": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "github actions": "GitHub Actions",
  "terraform": "Terraform",
  "linux": "Linux",
  "git": "Git",

  // Testing & Tooling
  "jest": "Jest",
  "playwright": "Playwright",
  "cypress": "Cypress",
  "unit testing": "Unit Testing",
  "integration testing": "Integration Testing",
  "e2e testing": "E2E Testing",
  "end-to-end testing": "E2E Testing",
  "tdd": "TDD",

  // Data, AI & Analytics
  "python": "Python",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "tableau": "Tableau",
  "power bi": "Power BI",
  "a/b testing": "A/B Testing",
  "ab testing": "A/B Testing",
  "machine learning": "Machine Learning",
  "deep learning": "Deep Learning",
  "nlp": "NLP",
  "llm": "LLMs",
  "openai api": "OpenAI API",
  "gemini api": "Gemini API",

  // Product & Management
  "product roadmap": "Product Roadmap",
  "roadmap": "Product Roadmap",
  "prd": "PRD Documentation",
  "user research": "User Research",
  "agile": "Agile / Scrum",
  "scrum": "Agile / Scrum",
  "kanban": "Kanban",
  "jira": "Jira",
  "kpis": "KPIs",
};

// Sorted multi-word phrases (longest first for greedy matching)
const SORTED_PHRASES = Object.keys(CANONICAL_TERMS_MAP)
  .filter((k) => k.includes(" ") || k.includes("/"))
  .sort((a, b) => b.length - a.length);

/**
 * Normalizes raw text safely preserving technical tokens and boundary spaces.
 */
export function normalizeAtsText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    // Replace non-alphanumeric chars with space, preserving symbols in technical tokens (+, #, ., -, /)
    .replace(/[^a-z0-9+#.\-/]/g, " ")
    // Ensure clean word boundaries around slashes and dots where appropriate
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cleans individual single tokens for keyword safety.
 */
function cleanSingleWord(raw: string): string {
  return raw.replace(/^[^\w+#.]+|[^\w+#.]+$/g, "").trim();
}

/**
 * Format a non-dictionary word into clean Title Case.
 */
function formatTitleCase(word: string): string {
  if (word.toUpperCase() === word && word.length <= 4) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Extracts canonical, human-readable keywords from a document or JD.
 */
export function extractCanonicalKeywords(text: string): {
  canonicalList: string[];
  normalizedSet: Set<string>;
} {
  if (!text || !text.trim()) {
    return { canonicalList: [], normalizedSet: new Set() };
  }

  const normalized = normalizeAtsText(text);
  const normalizedWords = normalized.split(/\s+/).filter(Boolean);

  const matchedCanonicalMap = new Map<string, string>(); // canonicalKey -> displayLabel

  // 1. Multi-word phrase matching (Greedy longest match)
  let textForPhraseSearch = ` ${normalized} `;
  for (const phrase of SORTED_PHRASES) {
    const searchPattern = ` ${phrase} `;
    if (textForPhraseSearch.includes(searchPattern)) {
      const canonical = CANONICAL_TERMS_MAP[phrase];
      matchedCanonicalMap.set(canonical.toLowerCase(), canonical);
      // Remove matched phrase occurrences to avoid duplicate sub-token extraction
      textForPhraseSearch = textForPhraseSearch.replaceAll(searchPattern, " ");
    }
  }

  // 2. Single token matching
  for (const rawWord of normalizedWords) {
    const word = cleanSingleWord(rawWord);
    if (!word || word.length < 2 || word.length > 25) continue;
    if (!isNaN(Number(word))) continue;

    // Check canonical dictionary first
    if (CANONICAL_TERMS_MAP[word]) {
      const canonical = CANONICAL_TERMS_MAP[word];
      matchedCanonicalMap.set(canonical.toLowerCase(), canonical);
      continue;
    }

    // Skip stop words and HR boilerplate
    if (MASTER_STOP_WORDS.has(word)) continue;

    // Filter out common English verbs, conjunctions, and generic filler
    if (/^(?:using|build|building|built|create|creating|look|looking|seek|seeking|join|work|working|manage|management|help|helping|responsible|coordinate|participate|develop|developing)$/i.test(word)) {
      continue;
    }

    // Add clean formatted domain keyword if valid
    const display = formatTitleCase(word);
    matchedCanonicalMap.set(word.toLowerCase(), display);
  }

  const canonicalList = Array.from(matchedCanonicalMap.values());
  const normalizedSet = new Set(Array.from(matchedCanonicalMap.keys()));

  return { canonicalList, normalizedSet };
}

/**
 * Computes canonical Matched, Missing, and Suggested keyword lists.
 */
export function computeKeywordBreakdown(
  resumeText: string,
  jobDescription: string
): {
  matched: string[];
  missing: string[];
  suggested: string[];
} {
  const resumeExtracted = extractCanonicalKeywords(resumeText);
  const jdExtracted = extractCanonicalKeywords(jobDescription);

  if (!jobDescription || jobDescription.trim().length < 20) {
    // Quality mode without target JD
    return {
      matched: resumeExtracted.canonicalList.slice(0, 16),
      missing: [],
      suggested: [
        "Quantified Metrics",
        "CI/CD Pipelines",
        "Cloud Architecture (AWS/GCP)",
        "Automated Testing (Jest/Playwright)",
        "System Performance",
      ].filter((s) => !resumeExtracted.normalizedSet.has(s.toLowerCase())),
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  // Match JD keywords against Resume
  for (const jdKeyword of jdExtracted.canonicalList) {
    const key = jdKeyword.toLowerCase();
    // Check if resume contains this canonical concept or normalized text includes it
    if (
      resumeExtracted.normalizedSet.has(key) ||
      normalizeAtsText(resumeText).includes(key)
    ) {
      matched.push(jdKeyword);
    } else {
      missing.push(jdKeyword);
    }
  }

  // Determine suggested additions (role-relevant technical items not in resume)
  const suggestedPool = [
    "CI/CD",
    "Docker",
    "Unit Testing",
    "Core Web Vitals",
    "TypeScript",
    "REST API",
    "State Management",
    "Microservices",
    "System Design",
    "Cloud Computing (AWS/GCP)",
  ];

  const suggested = suggestedPool.filter((item) => {
    const key = item.toLowerCase();
    return (
      !resumeExtracted.normalizedSet.has(key) &&
      !matched.some((m) => m.toLowerCase() === key) &&
      !missing.some((m) => m.toLowerCase() === key)
    );
  }).slice(0, 6);

  return {
    matched: Array.from(new Set(matched)),
    missing: Array.from(new Set(missing)),
    suggested: Array.from(new Set(suggested)),
  };
}
