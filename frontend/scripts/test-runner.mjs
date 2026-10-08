// Pure ESM verification of ATS Keyword Extraction logic and test cases

const CANONICAL_TERMS_MAP = {
  "react": "React",
  "react.js": "React",
  "next": "Next.js",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "node": "Node.js",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "graphql": "GraphQL",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  "restful api": "REST APIs",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "docker": "Docker",
  "jest": "Jest",
  "playwright": "Playwright",
  "redux": "Redux Toolkit",
  "redux toolkit": "Redux Toolkit",
  "react query": "React Query",
  "tanstack query": "React Query",
  "zustand": "Zustand",
  "tailwind": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "core web vitals": "Core Web Vitals",
  "wcag": "WCAG",
  "accessibility": "WCAG Accessibility",
  "app router": "App Router",
  "high performance": "High Performance",
  "performance": "Web Performance",
  "web performance": "Web Performance",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "git": "Git",
  "github": "GitHub",
  "aws": "AWS",
  "python": "Python",
  "sql": "SQL",
  "postgresql": "PostgreSQL",
  "mongodb": "MongoDB"
};

const STOPWORDS = new Set([
  "the", "and", "or", "with", "for", "from", "to", "of", "in", "on", "at", "by", "an", "a",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "this", "that", "these", "those", "we", "you", "they", "our", "your", "their", "will", "can",
  "looking", "seeking", "experience", "experienced", "skills", "ability", "proficient",
  "responsible", "requirements", "qualifications", "preferred", "role", "team", "work"
]);

function normalizeAtsText(text) {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/([A-Za-z0-9])\n([A-Za-z0-9])/g, "$1 $2")
    .replace(/\n+/g, " ")
    .replace(/[^\w\s\.\+#\/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCanonicalKeywords(rawText) {
  const text = normalizeAtsText(rawText);
  if (!text) return { canonicalList: [], normalizedSet: new Set() };

  const canonicalFound = new Map();
  const lowerText = ` ${text.toLowerCase()} `;

  const multiWordEntries = Object.entries(CANONICAL_TERMS_MAP)
    .filter(([k]) => k.includes(" ") || k.includes("/"))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [key, canonical] of multiWordEntries) {
    const pattern = new RegExp(`(?<=[^a-z0-9]|^)${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^a-z0-9]|$)`, "gi");
    if (pattern.test(lowerText)) {
      canonicalFound.set(canonical.toLowerCase(), canonical);
    }
  }

  const rawTokens = text.split(/[\s,;|/()]+/).filter(Boolean);

  for (const rawToken of rawTokens) {
    const cleaned = rawToken.replace(/^[^\w\+#]+|[^\w\+#]+$/g, "").toLowerCase();
    if (!cleaned || cleaned.length < 2) continue;
    if (STOPWORDS.has(cleaned)) continue;

    if (CANONICAL_TERMS_MAP[cleaned]) {
      const canonical = CANONICAL_TERMS_MAP[cleaned];
      canonicalFound.set(canonical.toLowerCase(), canonical);
      continue;
    }

    if (/^[a-z]+$/i.test(cleaned) && cleaned.length >= 3 && !STOPWORDS.has(cleaned)) {
      const displayForm = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (!canonicalFound.has(cleaned)) {
        canonicalFound.set(cleaned, displayForm);
      }
    }
  }

  const canonicalList = Array.from(canonicalFound.values());
  const normalizedSet = new Set(Array.from(canonicalFound.keys()));
  return { canonicalList, normalizedSet };
}

function computeKeywordBreakdown(resumeText, jdText) {
  const resumeExt = extractCanonicalKeywords(resumeText);
  const jdExt = extractCanonicalKeywords(jdText);

  const matched = [];
  const missing = [];

  for (const jdCanonical of jdExt.canonicalList) {
    const lower = jdCanonical.toLowerCase();
    if (resumeExt.normalizedSet.has(lower)) {
      matched.push(jdCanonical);
    } else {
      missing.push(jdCanonical);
    }
  }

  const missingSet = new Set(missing.map((k) => k.toLowerCase()));
  const suggested = missing.slice(0, 10);

  return {
    matched: Array.from(new Set(matched)),
    missing: Array.from(new Set(missing)),
    suggested: Array.from(new Set(suggested))
  };
}

console.log("==================================================");
console.log("ATS KEYWORD EXTRACTION & NORMALIZATION TEST SUITE");
console.log("==================================================");

let passed = 0;
let total = 0;

function assert(condition, name, details = "") {
  total++;
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name} -> ${details}`);
  }
}

// CASE 1: "React, Next.js, TypeScript"
const c1 = extractCanonicalKeywords("React, Next.js, TypeScript").canonicalList;
assert(c1.includes("React") && c1.includes("Next.js") && c1.includes("TypeScript") && c1.length === 3,
  "Case 1: 'React, Next.js, TypeScript' produces 3 clean canonical tokens without duplication", JSON.stringify(c1));

// CASE 2: "GraphQL APIs, CI/CD, Docker"
const c2 = extractCanonicalKeywords("GraphQL APIs, CI/CD, Docker").canonicalList;
assert(c2.includes("GraphQL") && c2.includes("CI/CD") && c2.includes("Docker") && !c2.some(k => k.includes("graphqlapicicd")),
  "Case 2: 'GraphQL APIs, CI/CD, Docker' preserves word boundaries and produces no concatenated string", JSON.stringify(c2));

// CASE 3: "React React React Next.js Next.js"
const c3 = extractCanonicalKeywords("React React React Next.js Next.js").canonicalList;
assert(c3.length === 2 && c3.includes("React") && c3.includes("Next.js"),
  "Case 3: 'React React React Next.js Next.js' correctly deduplicates repeated words", JSON.stringify(c3));

// CASE 4: "high-performance web applications"
const c4 = extractCanonicalKeywords("high-performance web applications").canonicalList;
assert(!c4.some(k => k.includes("high-performancehigh-performance")),
  "Case 4: 'high-performance web applications' produces clean tokens without repeat-joining", JSON.stringify(c4));

// CASE 5: "Next.js App Router"
const c5 = extractCanonicalKeywords("Next.js App Router").canonicalList;
assert(c5.includes("Next.js") && c5.includes("App Router"),
  "Case 5: 'Next.js App Router' produces meaningful technical phrases", JSON.stringify(c5));

// CASE 6: "Core Web Vitals and WCAG accessibility"
const c6 = extractCanonicalKeywords("Core Web Vitals and WCAG accessibility").canonicalList;
assert(c6.includes("Core Web Vitals") && c6.includes("WCAG"),
  "Case 6: 'Core Web Vitals and WCAG accessibility' extracts full concepts", JSON.stringify(c6));

// CASE 7: "the and for with from to"
const c7 = extractCanonicalKeywords("the and for with from to").canonicalList;
assert(c7.length === 0,
  "Case 7: Generic stopwords are safely rejected", JSON.stringify(c7));

// CASE 8: PDF-extracted text with line breaks
const c8 = extractCanonicalKeywords("Next.js\nApp Router\nReact\nTypeScript").canonicalList;
assert(c8.includes("Next.js") && c8.includes("App Router") && c8.includes("React") && c8.includes("TypeScript") && !c8.some(k => k.includes("\n")),
  "Case 8: PDF text with newline breaks preserves token boundaries", JSON.stringify(c8));

// Comprehensive breakdown test
const resume = "Senior Frontend Engineer with 5+ years experience building web apps with React, TypeScript, Next.js, Tailwind CSS, HTML5, CSS3, and Git.";
const jd = "Seeking Senior Frontend Engineer skilled in React, TypeScript, Next.js, GraphQL, REST APIs, CI/CD, Docker, Jest, Redux Toolkit, and Tailwind CSS.";
const breakdown = computeKeywordBreakdown(resume, jd);

assert(breakdown.matched.includes("React") && breakdown.matched.includes("TypeScript") && breakdown.matched.includes("Next.js") && breakdown.matched.includes("Tailwind CSS"),
  "Breakdown: Matched keywords correctly categorized", JSON.stringify(breakdown.matched));

assert(breakdown.missing.includes("GraphQL") && breakdown.missing.includes("CI/CD") && breakdown.missing.includes("Docker") && breakdown.missing.includes("Jest"),
  "Breakdown: Missing keywords correctly categorized", JSON.stringify(breakdown.missing));

assert(breakdown.suggested.length > 0 && !breakdown.suggested.some(k => breakdown.matched.includes(k)),
  "Breakdown: Suggested keywords are valid missing items, not duplicates of matched", JSON.stringify(breakdown.suggested));

console.log("==================================================");
console.log(`SUMMARY: ${passed} of ${total} tests PASSED.`);
console.log("==================================================");
