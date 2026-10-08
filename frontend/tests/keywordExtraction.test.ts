import { extractCanonicalKeywords, computeKeywordBreakdown, normalizeAtsText } from "../lib/keywordExtractor";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("==================================================");
console.log("RUNNING ATS KEYWORD EXTRACTION TEST SUITE");
console.log("==================================================");

// CASE 1: Basic list
{
  const input = "React, Next.js, TypeScript";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 1 Output:", canonicalList);
  assert(canonicalList.includes("React"), "Case 1 should include React");
  assert(canonicalList.includes("Next.js"), "Case 1 should include Next.js");
  assert(canonicalList.includes("TypeScript"), "Case 1 should include TypeScript");
  assert(canonicalList.length === 3, "Case 1 should have exactly 3 keywords");
  console.log("✓ Case 1 passed");
}

// CASE 2: Technical phrases with punctuation & slashes
{
  const input = "GraphQL APIs, CI/CD, Docker";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 2 Output:", canonicalList);
  assert(canonicalList.includes("GraphQL"), "Case 2 should include GraphQL");
  assert(canonicalList.includes("CI/CD"), "Case 2 should include CI/CD");
  assert(canonicalList.includes("Docker"), "Case 2 should include Docker");
  assert(!canonicalList.some(k => k.includes("graphqlapici")), "Case 2 should NOT concatenate");
  console.log("✓ Case 2 passed");
}

// CASE 3: Repeated text
{
  const input = "React React React Next.js Next.js";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 3 Output:", canonicalList);
  assert(canonicalList.includes("React"), "Case 3 should include React");
  assert(canonicalList.includes("Next.js"), "Case 3 should include Next.js");
  assert(canonicalList.length === 2, "Case 3 should deduplicate to exactly 2 keywords");
  console.log("✓ Case 3 passed");
}

// CASE 4: High-performance phrase
{
  const input = "high-performance web applications";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 4 Output:", canonicalList);
  assert(!canonicalList.some(k => k.includes("high-performancehigh-performance")), "Case 4 must not duplicate token");
  console.log("✓ Case 4 passed");
}

// CASE 5: Multi-word phrase App Router
{
  const input = "Next.js App Router";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 5 Output:", canonicalList);
  assert(canonicalList.includes("App Router") || canonicalList.includes("Next.js"), "Case 5 should extract App Router and/or Next.js");
  console.log("✓ Case 5 passed");
}

// CASE 6: Core Web Vitals & WCAG
{
  const input = "Core Web Vitals and WCAG accessibility";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 6 Output:", canonicalList);
  assert(canonicalList.includes("Core Web Vitals"), "Case 6 should include Core Web Vitals");
  assert(canonicalList.includes("WCAG Accessibility") || canonicalList.includes("Accessibility"), "Case 6 should include Accessibility");
  console.log("✓ Case 6 passed");
}

// CASE 7: Stopwords
{
  const input = "the and for with from to";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 7 Output:", canonicalList);
  assert(canonicalList.length === 0, "Case 7 should reject stopwords");
  console.log("✓ Case 7 passed");
}

// CASE 8: PDF-extracted text with line breaks
{
  const input = "Next.js\nApp Router\nReact\nTypeScript";
  const { canonicalList } = extractCanonicalKeywords(input);
  console.log("Case 8 Output:", canonicalList);
  assert(canonicalList.includes("Next.js"), "Case 8 should include Next.js");
  assert(canonicalList.includes("React"), "Case 8 should include React");
  assert(canonicalList.includes("TypeScript"), "Case 8 should include TypeScript");
  console.log("✓ Case 8 passed");
}

// CASE 9: Full Job Description Matching & Breakdown
{
  const resume = `
    Alex Rivera - Full Stack Engineer
    Skills: React, TypeScript, Next.js, Node.js, Python, Docker, PostgreSQL, Tailwind CSS
    Experience: Built scalable web applications with React and Next.js.
  `;
  const jd = `
    Senior Frontend Developer
    Requirements:
    • React, Next.js, TypeScript, and Tailwind CSS.
    • Experience with GraphQL APIs, CI/CD pipelines, and Playwright automated testing.
    • Core Web Vitals and WCAG accessibility optimization.
  `;

  const breakdown = computeKeywordBreakdown(resume, jd);
  console.log("Matched Keywords:", breakdown.matched);
  console.log("Missing Keywords:", breakdown.missing);
  console.log("Suggested Keywords:", breakdown.suggested);

  assert(breakdown.matched.includes("React"), "Matched must include React");
  assert(breakdown.matched.includes("TypeScript"), "Matched must include TypeScript");
  assert(breakdown.matched.includes("Next.js"), "Matched must include Next.js");
  assert(breakdown.matched.includes("Tailwind CSS"), "Matched must include Tailwind CSS");

  assert(breakdown.missing.includes("GraphQL"), "Missing must include GraphQL");
  assert(breakdown.missing.includes("CI/CD"), "Missing must include CI/CD");
  assert(breakdown.missing.includes("Playwright"), "Missing must include Playwright");

  assert(!breakdown.missing.some(k => k.includes("graphqlapici")), "Missing must NOT have concatenated tokens");
  console.log("✓ Case 9 Full Breakdown passed!");
}

console.log("==================================================");
console.log("ALL ATS KEYWORD EXTRACTION TESTS PASSED SUCCESSFULLY!");
console.log("==================================================");
