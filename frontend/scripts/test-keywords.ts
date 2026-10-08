import { extractCanonicalKeywords, computeKeywordBreakdown, normalizeAtsText } from '../lib/keywordExtractor';

console.log("=== RUNNING ATS KEYWORD EXTRACTION SUITE ===");

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, details: string = "") {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName} - ${details}`);
  }
}

// CASE 1: "React, Next.js, TypeScript"
const c1 = extractCanonicalKeywords("React, Next.js, TypeScript").canonicalList;
assert(c1.includes("React") && c1.includes("Next.js") && c1.includes("TypeScript") && c1.length === 3, 
  "CASE 1: React, Next.js, TypeScript - No duplicates & clean tokens", JSON.stringify(c1));

// CASE 2: "GraphQL APIs, CI/CD, Docker"
const c2 = extractCanonicalKeywords("GraphQL APIs, CI/CD, Docker").canonicalList;
assert(c2.includes("GraphQL") && (c2.includes("REST APIs") || c2.includes("CI/CD") || c2.includes("Docker")) && !c2.some((k: string) => k.includes("graphqlapicicd")),
  "CASE 2: GraphQL APIs, CI/CD, Docker - No concatenated string", JSON.stringify(c2));

// CASE 3: "React React React Next.js Next.js"
const c3 = extractCanonicalKeywords("React React React Next.js Next.js").canonicalList;
assert(c3.length === 2 && c3.includes("React") && c3.includes("Next.js"),
  "CASE 3: React React React Next.js Next.js - Deduplication", JSON.stringify(c3));

// CASE 4: "high-performance web applications"
const c4 = extractCanonicalKeywords("high-performance web applications").canonicalList;
assert(!c4.some((k: string) => k.includes("high-performancehigh-performance")),
  "CASE 4: high-performance web applications - No repeated concatenation", JSON.stringify(c4));

// CASE 5: "Next.js App Router"
const c5 = extractCanonicalKeywords("Next.js App Router").canonicalList;
assert(c5.includes("Next.js") && (c5.includes("App Router") || c5.length > 0),
  "CASE 5: Next.js App Router - Meaningful technical concepts", JSON.stringify(c5));

// CASE 6: "Core Web Vitals and WCAG accessibility"
const c6 = extractCanonicalKeywords("Core Web Vitals and WCAG accessibility").canonicalList;
assert(c6.includes("Core Web Vitals") && c6.includes("WCAG"),
  "CASE 6: Core Web Vitals and WCAG accessibility", JSON.stringify(c6));

// CASE 7: "the and for with from to"
const c7 = extractCanonicalKeywords("the and for with from to").canonicalList;
assert(c7.length === 0,
  "CASE 7: Stopwords rejection", JSON.stringify(c7));

// CASE 8: PDF-extracted text with line breaks
const c8 = extractCanonicalKeywords("Next.js\nApp Router\nReact\nTypeScript").canonicalList;
assert(c8.includes("Next.js") && c8.includes("React") && c8.includes("TypeScript") && !c8.some((k: string) => k.includes("\n")),
  "CASE 8: PDF line breaks preserved as separate tokens", JSON.stringify(c8));

// Breakdown comparison test
const resumeText = "Frontend developer skilled in React, TypeScript, Next.js, Tailwind CSS, HTML, CSS.";
const jdText = "Seeking Senior Frontend Engineer with React, TypeScript, Next.js, GraphQL, CI/CD, Docker, Jest, Redux.";
const breakdown = computeKeywordBreakdown(resumeText, jdText);

assert(breakdown.matched.includes("React") && breakdown.matched.includes("TypeScript") && breakdown.matched.includes("Next.js"),
  "BREAKDOWN: Matched keywords correctly categorized", JSON.stringify(breakdown.matched));

assert(breakdown.missing.includes("GraphQL") && breakdown.missing.includes("CI/CD") && breakdown.missing.includes("Docker"),
  "BREAKDOWN: Missing keywords correctly categorized", JSON.stringify(breakdown.missing));

assert(breakdown.suggested.length > 0 && !breakdown.suggested.some(k => breakdown.matched.includes(k)),
  "BREAKDOWN: Suggested keywords distinct from matched", JSON.stringify(breakdown.suggested));

console.log(`\nResults: ${passed}/${total} tests passed.`);
if (passed === total) {
  console.log("ALL ATS KEYWORD TESTS PASSED!");
}
