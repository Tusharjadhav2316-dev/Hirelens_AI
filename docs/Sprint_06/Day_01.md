# Sprint 6 — Day 1: Career Coach Architecture, Data Contracts & Prompt Design

## Day Title
**AI Career Coach — Architecture, Data Contracts & Prompt Design**

## Objective
Define the complete Sprint 6 architectural contract before a single UI or API component is built. Today produces two things: (1) the `lib/careerCoachService.ts` module containing all pure helper functions and type definitions, and (2) new exports in `lib/promptTemplates.ts` for the Career Coach system prompt and model parameters.

## Why This Day Exists
Sprint 6 introduces the most architecturally significant change since the project began: a conversational, multi-turn, context-aware AI layer that sits *above* the existing tools rather than inside them. Getting the data contracts and prompt architecture right on Day 1 prevents three failure modes that commonly sink conversational AI features:
1. **Token bloat** — passing the entire raw `Resume` JSON to every API call.
2. **Hallucination leakage** — the Coach inventing ATS scores or resume facts instead of explaining deterministic engine output.
3. **Context confusion** — the model mixing up "what the user told me" vs. "what HireLens computed" vs. "what I invented."

Day 1 is pure library code — no UI, no API route, no Firestore. Everything here is pure TypeScript functions and type definitions that can be tested deterministically without network access.

## Repository Evidence / Current State
- **`lib/promptTemplates.ts`** — confirmed exports: `RESUME_OPTIMIZER_PERSONA`, `ATS_EXPERT_PERSONA`, `HALLUCINATION_GUARDRAIL`, `OUTPUT_FORMAT_PLAIN`, `OUTPUT_FORMAT_BULLETS`, `AI_INSIGHTS_SYSTEM_PROMPT`, all model params, `OptimizerMode`, `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`, `buildOptimizerPrompt`. No Career Coach exports exist yet.
- **`types/resume.ts`** — confirmed: `Resume`, `PersonalInfo`, `Experience`, `Education`, `Skill`, `Project`, `Achievement`, `Certification` types.
- **`lib/aiService.ts`** — establishes the module pattern: pure service functions, client-side, no direct Firebase/OpenRouter calls.
- **`lib/atsAnalyzer.ts`** — confirmed: `analyzeResume(resume, isOverflowing)` returns `ATSAnalysisResult` with `overallScore`, `sectionScores`, `warnings`, `suggestions`, `keywordDensityScore`, `impactScore`, `completenessScore`.
- **No `lib/careerCoachService.ts` exists** — new file today.

## Concepts
- **Stateless API, stateful client:** The Career Coach API route will be stateless — it receives conversation history in each request body and returns a response. All conversation state lives in client-side React state. No session storage, no Firestore persistence in Sprint 6.
- **Context blocks, not raw dumps:** Instead of sending `JSON.stringify(resume)` (400–2000 tokens of noisy JSON), the coach receives a *curated context block* — a structured plaintext summary of the candidate's profile, formatted for LLM consumption.
- **Deterministic vs. AI-generated content — explicit labelling:** The system prompt must clearly separate: (a) information supplied from the deterministic ATS engine (labelled as such), (b) information from the resume (labelled as such), and (c) the Coach's own reasoning (always clearly a recommendation, never presented as fact).
- **Token budget:** `google/gemini-2.5-flash` supports a 1M context window, so token limits are not a hard constraint here. However, we design defensively: system prompt ≈ 600 tokens, resume context ≈ 600 tokens, ATS context ≈ 200 tokens, JD context ≈ 300 tokens, conversation history (last 8 turns × ~150 tokens) ≈ 1200 tokens, current message ≈ 200 tokens — total ≈ 3100 tokens in. Max response: 800 tokens.

## Prerequisites
- Sprint 5 complete; `npm run build` succeeds; `npx tsx tests/atsBenchmark.test.ts` and `npx tsx tests/optimizerSafety.test.ts` both pass.
- Read `lib/promptTemplates.ts` in full before adding new exports.
- Read `types/resume.ts` in full — `buildResumeContextBlock` must handle every field.
- Read `lib/atsAnalyzer.ts` to understand the `ATSAnalysisResult` shape returned by `analyzeResume()`.

## Setup
No new packages required today.
```bash
cd frontend
npm run build   # confirm clean baseline
```

## Resources
- `lib/promptTemplates.ts` — extended today
- `types/resume.ts` — reference for Resume type shape
- `lib/atsAnalyzer.ts` — reference for ATSAnalysisResult shape

## Files to Inspect
- `frontend/lib/promptTemplates.ts`
- `frontend/types/resume.ts`
- `frontend/lib/atsAnalyzer.ts`

## Files to Modify
- `frontend/lib/promptTemplates.ts` — add Career Coach exports

## Files to Create
- `frontend/lib/careerCoachService.ts` **[NEW]** — pure helper functions and type definitions for the Career Coach feature

## Architecture Impact
`lib/careerCoachService.ts` joins `lib/aiService.ts` and `lib/promptTemplates.ts` as a foundational library module. It has zero runtime dependencies (no Firebase, no fetch calls, no OpenRouter) — it is pure TypeScript that transforms data into strings and structures. This makes it fully testable in Sprint 6 Day 8's safety test suite without any mocking.

## Data Flow
```
Resume (from ResumeContext)
    → buildResumeContextBlock(resume) → string
    
ATSAnalysisResult (from analyzeResume() client-side)
    → buildATSContextBlock(atsResult) → string
    
JobDescription (optional, from user input)
    → included directly with header

ConversationHistory (from client useState)
    → trimConversationHistory(messages, maxTurns) → ChatMessage[]

All of the above → career-coach API route body
```

## Implementation Plan

### Step 1 — Add to `lib/promptTemplates.ts`

After the existing exports, add:

```typescript
// ─── Career Coach ────────────────────────────────────────────────────────────

export const CAREER_COACH_MODEL_PARAMS = {
    max_tokens: 800,
    temperature: 0.7,
};

export const CAREER_COACH_SYSTEM_PROMPT = [
    "You are HireLens Career Coach — an expert AI career advisor embedded within the HireLens career platform.",
    "Your role is to help candidates understand their resumes, improve their job application strategy, and interpret career intelligence provided to you.",
    "",
    "IDENTITY AND SCOPE:",
    "- You are HireLens Career Coach, not a general-purpose AI assistant.",
    "- You specialize in resume strategy, ATS optimization, job application coaching, and career development.",
    "- When asked about topics outside career coaching (e.g., cooking, coding tutorials, general trivia), politely redirect to your area of expertise.",
    "",
    "TRUTH AND ACCURACY RULES — NON-NEGOTIABLE:",
    "- You will be given the candidate's actual resume content and ATS analysis results. Use ONLY this provided information when discussing the candidate's profile.",
    "- NEVER invent skills, experience, companies, roles, certifications, degrees, metrics, or achievements the candidate has not mentioned.",
    "- NEVER fabricate ATS scores, keyword match percentages, or compatibility ratings. If ATS data is provided, reference it accurately. If ATS data is NOT provided in the context, say so.",
    "- NEVER claim to have searched external job boards, company databases, or recruiter networks unless a specific tool integration is explicitly available to you (none is in Sprint 6).",
    "- NEVER promise that a resume change will increase an ATS score by a specific amount unless you are referencing a deterministic engine result already computed and supplied in context.",
    "- When a candidate asks whether they qualify for a role, give an honest assessment based on what IS in their resume — not an optimistic fabrication.",
    "",
    "CONTEXT LABELLING — HOW TO REFERENCE PROVIDED DATA:",
    "- When referencing ATS scores, say: 'According to your HireLens ATS analysis...' or 'Your current ATS score shows...' — not 'I calculated that...'",
    "- When referencing resume content, say: 'Based on what you've added to your resume...' — not 'I can see that you worked at...'",
    "- When giving career advice or recommendations, use language like: 'I'd suggest...' or 'One strategy would be...' — clearly distinguishing your coaching from verified facts.",
    "",
    "FORMATTING:",
    "- Use clear, conversational language. Avoid excessive bullet points for short answers.",
    "- For structured advice (e.g., lists of improvements), use concise bullet points.",
    "- Keep responses focused and actionable. Do not pad with caveats.",
    HALLUCINATION_GUARDRAIL,
].join("\n");
```

### Step 2 — Create `lib/careerCoachService.ts`

```typescript
/**
 * Career Coach Service — Pure Helper Functions
 * Sprint 6, Day 1
 *
 * All functions are pure (no side effects, no network calls, no Firebase).
 * Fully testable without mocking.
 */

import { Resume } from "@/types/resume";

// ─── Message Types ────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface CareerCoachRequest {
    messages: ChatMessage[];
    resumeContext?: string;
    atsContext?: string;
    jobDescription?: string;
}

// ─── Context Builders ─────────────────────────────────────────────────────────

/**
 * Builds a curated plaintext summary of a Resume for the Career Coach context.
 * Truncates long descriptions to prevent token bloat.
 * Returns an empty string if the resume has no meaningful content.
 */
export function buildResumeContextBlock(resume: Resume): string {
    const lines: string[] = [];

    lines.push("=== CANDIDATE RESUME CONTEXT ===");
    lines.push("(This information comes from the candidate's HireLens resume — not from AI inference.)");
    lines.push("");

    // Personal Info
    const p = resume.personalInfo;
    if (p.fullName) lines.push(`Name: ${p.fullName}`);
    if (p.summary) lines.push(`Summary: ${p.summary.substring(0, 300)}${p.summary.length > 300 ? "..." : ""}`);
    if (p.location) lines.push(`Location: ${p.location}`);

    // Skills
    if (resume.skills.length > 0) {
        const skillNames = resume.skills.map(s => s.name).join(", ");
        lines.push(`\nSkills: ${skillNames.substring(0, 400)}`);
    }

    // Experience
    if (resume.experience.length > 0) {
        lines.push("\nWork Experience:");
        for (const exp of resume.experience.slice(0, 5)) { // cap at 5 most recent
            lines.push(`  • ${exp.position} at ${exp.company} (${exp.startDate} – ${exp.current ? "Present" : exp.endDate})`);
            if (exp.description) {
                lines.push(`    ${exp.description.substring(0, 200)}${exp.description.length > 200 ? "..." : ""}`);
            }
        }
    }

    // Education
    if (resume.education.length > 0) {
        lines.push("\nEducation:");
        for (const edu of resume.education) {
            lines.push(`  • ${edu.degree} in ${edu.fieldOfStudy} — ${edu.institution} (${edu.startDate} – ${edu.endDate})`);
        }
    }

    // Projects
    if (resume.projects.length > 0) {
        lines.push("\nProjects:");
        for (const proj of resume.projects.slice(0, 4)) {
            lines.push(`  • ${proj.name}: ${proj.description.substring(0, 150)}${proj.description.length > 150 ? "..." : ""}`);
        }
    }

    // Achievements
    if (resume.achievements.length > 0) {
        lines.push("\nAchievements:");
        for (const ach of resume.achievements) {
            lines.push(`  • ${ach.title}`);
        }
    }

    // Certifications
    if (resume.certifications.length > 0) {
        lines.push("\nCertifications:");
        for (const cert of resume.certifications) {
            lines.push(`  • ${cert.name}${cert.issuer ? " (" + cert.issuer + ")" : ""}${cert.year ? ", " + cert.year : ""}`);
        }
    }

    lines.push("\n=== END RESUME CONTEXT ===");

    // If the resume only has default/empty values, return empty string
    const hasContent = p.fullName || resume.experience.length > 0 || resume.skills.length > 0;
    return hasContent ? lines.join("\n") : "";
}

/**
 * Builds a plaintext block from an ATS analysis result for Career Coach context.
 * Clearly labels these as DETERMINISTIC ENGINE OUTPUT — not AI-generated scores.
 * The `ATSAnalysisResult` type is inlined here to avoid coupling to atsAnalyzer.ts.
 */
export interface ATSContextInput {
    overallScore: number;
    sectionScores: {
        summary: number;
        skills: number;
        experience: number;
        projects: number;
        education: number;
    };
    keywordDensityScore: number;
    impactScore: number;
    completenessScore: number;
    warnings: string[];
    suggestions: string[];
}

export function buildATSContextBlock(ats: ATSContextInput): string {
    const lines: string[] = [];
    lines.push("=== HIRELENS ATS ANALYSIS (DETERMINISTIC ENGINE OUTPUT) ===");
    lines.push("(These scores were calculated by HireLens's deterministic ATS engine — not by AI estimation.)");
    lines.push("");
    lines.push(`Overall ATS Score: ${Math.round(ats.overallScore)}/100`);
    lines.push(`\nSection Scores:`);
    lines.push(`  Summary: ${Math.round(ats.sectionScores.summary)}/100`);
    lines.push(`  Experience: ${Math.round(ats.sectionScores.experience)}/100`);
    lines.push(`  Skills: ${Math.round(ats.sectionScores.skills)}/100`);
    lines.push(`  Projects: ${Math.round(ats.sectionScores.projects)}/100`);
    lines.push(`  Education: ${Math.round(ats.sectionScores.education)}/100`);
    lines.push(`\nIntelligence Signals:`);
    lines.push(`  Keyword Integration: ${Math.round(ats.keywordDensityScore)}/100`);
    lines.push(`  Impact & Metrics: ${Math.round(ats.impactScore)}/100`);
    lines.push(`  Profile Completeness: ${Math.round(ats.completenessScore)}/100`);
    if (ats.warnings.length > 0) {
        lines.push(`\nWarnings: ${ats.warnings.slice(0, 3).join("; ")}`);
    }
    if (ats.suggestions.length > 0) {
        lines.push(`\nTop Suggestions from Engine: ${ats.suggestions.slice(0, 3).join("; ")}`);
    }
    lines.push("\n=== END ATS ANALYSIS ===");
    return lines.join("\n");
}

/**
 * Trims conversation history to the most recent N full turns (user + assistant pairs).
 * Preserves the most recent messages. Prevents token bloat on long conversations.
 */
export function trimConversationHistory(messages: ChatMessage[], maxTurns: number = 8): ChatMessage[] {
    // Each "turn" is one user message + one assistant reply = 2 messages
    const maxMessages = maxTurns * 2;
    if (messages.length <= maxMessages) return messages;
    return messages.slice(messages.length - maxMessages);
}

/**
 * Returns true if a resume has enough content to provide meaningful coaching.
 * Used to decide whether to include resume context in a request.
 */
export function hasResumeContent(resume: Resume): boolean {
    return !!(
        resume.personalInfo.fullName ||
        resume.experience.length > 0 ||
        resume.skills.length > 0 ||
        resume.projects.length > 0
    );
}

/**
 * Formats a JD for inclusion in the Career Coach context.
 */
export function buildJDContextBlock(jobDescription: string): string {
    if (!jobDescription || jobDescription.trim().length < 20) return "";
    return [
        "=== TARGET JOB DESCRIPTION (provided by candidate) ===",
        "(Use this to answer questions about role fit — do not claim the candidate has skills not present in their resume.)",
        "",
        jobDescription.substring(0, 2000),
        "\n=== END JOB DESCRIPTION ===",
    ].join("\n");
}
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 1: Career Coach Architecture.

I am modifying one existing file and creating one new file today. No UI, no API routes, no Firestore, no network calls.

Files modified/created:
1. frontend/lib/promptTemplates.ts — ADD new Career Coach exports only. Do NOT change any existing export.
2. frontend/lib/careerCoachService.ts — CREATE new file with pure helper functions.

CHANGE 1: Add to frontend/lib/promptTemplates.ts (after all existing exports, do not change any existing export):

export const CAREER_COACH_MODEL_PARAMS = {
    max_tokens: 800,
    temperature: 0.7,
};

export const CAREER_COACH_SYSTEM_PROMPT = [
    "You are HireLens Career Coach — an expert AI career advisor embedded within the HireLens career platform.",
    "Your role is to help candidates understand their resumes, improve their job application strategy, and interpret career intelligence provided to you.",
    "",
    "IDENTITY AND SCOPE:",
    "- You are HireLens Career Coach, not a general-purpose AI assistant.",
    "- You specialize in resume strategy, ATS optimization, job application coaching, and career development.",
    "- When asked about topics outside career coaching (e.g., cooking, coding tutorials, general trivia), politely redirect to your area of expertise.",
    "",
    "TRUTH AND ACCURACY RULES — NON-NEGOTIABLE:",
    "- You will be given the candidate's actual resume content and ATS analysis results. Use ONLY this provided information when discussing the candidate's profile.",
    "- NEVER invent skills, experience, companies, roles, certifications, degrees, metrics, or achievements the candidate has not mentioned.",
    "- NEVER fabricate ATS scores, keyword match percentages, or compatibility ratings. If ATS data is provided, reference it accurately. If ATS data is NOT provided, say so explicitly.",
    "- NEVER claim to have searched external job boards, company databases, or recruiter networks.",
    "- NEVER promise that a resume change will increase an ATS score by a specific amount unless referencing a deterministic engine result supplied in context.",
    "- When a candidate asks whether they qualify for a role, give an honest assessment based ONLY on what is in their resume — not optimistic fabrication.",
    "",
    "CONTEXT LABELLING:",
    "- When referencing ATS scores: 'According to your HireLens ATS analysis...' not 'I calculated that...'",
    "- When referencing resume content: 'Based on what you've added to your resume...' not 'I can see that you worked at...'",
    "- When giving advice: 'I'd suggest...' or 'One strategy would be...' — clearly distinguishing coaching from verified facts.",
    "",
    "FORMATTING:",
    "- Use clear, conversational language. Avoid excessive bullet points for short answers.",
    "- For structured advice, use concise bullet points.",
    "- Keep responses focused and actionable.",
    HALLUCINATION_GUARDRAIL,
].join("\n");

CHANGE 2: Create frontend/lib/careerCoachService.ts with exactly this content:

/**
 * Career Coach Service — Pure Helper Functions
 * Sprint 6, Day 1
 * All functions are pure (no side effects, no network calls, no Firebase).
 */

import { Resume } from "@/types/resume";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface CareerCoachRequest {
    messages: ChatMessage[];
    resumeContext?: string;
    atsContext?: string;
    jobDescription?: string;
}

export interface ATSContextInput {
    overallScore: number;
    sectionScores: { summary: number; skills: number; experience: number; projects: number; education: number; };
    keywordDensityScore: number;
    impactScore: number;
    completenessScore: number;
    warnings: string[];
    suggestions: string[];
}

export function buildResumeContextBlock(resume: Resume): string {
    const lines: string[] = [];
    lines.push("=== CANDIDATE RESUME CONTEXT ===");
    lines.push("(This information comes from the candidate's HireLens resume — not from AI inference.)");
    lines.push("");
    const p = resume.personalInfo;
    if (p.fullName) lines.push(`Name: ${p.fullName}`);
    if (p.summary) lines.push(`Summary: ${p.summary.substring(0, 300)}${p.summary.length > 300 ? "..." : ""}`);
    if (p.location) lines.push(`Location: ${p.location}`);
    if (resume.skills.length > 0) {
        lines.push(`\nSkills: ${resume.skills.map(s => s.name).join(", ").substring(0, 400)}`);
    }
    if (resume.experience.length > 0) {
        lines.push("\nWork Experience:");
        for (const exp of resume.experience.slice(0, 5)) {
            lines.push(`  • ${exp.position} at ${exp.company} (${exp.startDate} – ${exp.current ? "Present" : exp.endDate})`);
            if (exp.description) lines.push(`    ${exp.description.substring(0, 200)}${exp.description.length > 200 ? "..." : ""}`);
        }
    }
    if (resume.education.length > 0) {
        lines.push("\nEducation:");
        for (const edu of resume.education) {
            lines.push(`  • ${edu.degree} in ${edu.fieldOfStudy} — ${edu.institution} (${edu.startDate} – ${edu.endDate})`);
        }
    }
    if (resume.projects.length > 0) {
        lines.push("\nProjects:");
        for (const proj of resume.projects.slice(0, 4)) {
            lines.push(`  • ${proj.name}: ${proj.description.substring(0, 150)}${proj.description.length > 150 ? "..." : ""}`);
        }
    }
    if (resume.achievements.length > 0) {
        lines.push("\nAchievements:");
        for (const ach of resume.achievements) lines.push(`  • ${ach.title}`);
    }
    if (resume.certifications.length > 0) {
        lines.push("\nCertifications:");
        for (const cert of resume.certifications) {
            lines.push(`  • ${cert.name}${cert.issuer ? " (" + cert.issuer + ")" : ""}${cert.year ? ", " + cert.year : ""}`);
        }
    }
    lines.push("\n=== END RESUME CONTEXT ===");
    const hasContent = !!(p.fullName || resume.experience.length > 0 || resume.skills.length > 0);
    return hasContent ? lines.join("\n") : "";
}

export function buildATSContextBlock(ats: ATSContextInput): string {
    const lines: string[] = [];
    lines.push("=== HIRELENS ATS ANALYSIS (DETERMINISTIC ENGINE OUTPUT) ===");
    lines.push("(These scores were calculated by HireLens's deterministic ATS engine — not by AI estimation.)");
    lines.push("");
    lines.push(`Overall ATS Score: ${Math.round(ats.overallScore)}/100`);
    lines.push(`\nSection Scores:`);
    lines.push(`  Summary: ${Math.round(ats.sectionScores.summary)}/100`);
    lines.push(`  Experience: ${Math.round(ats.sectionScores.experience)}/100`);
    lines.push(`  Skills: ${Math.round(ats.sectionScores.skills)}/100`);
    lines.push(`  Projects: ${Math.round(ats.sectionScores.projects)}/100`);
    lines.push(`  Education: ${Math.round(ats.sectionScores.education)}/100`);
    lines.push(`\nIntelligence Signals:`);
    lines.push(`  Keyword Integration: ${Math.round(ats.keywordDensityScore)}/100`);
    lines.push(`  Impact & Metrics: ${Math.round(ats.impactScore)}/100`);
    lines.push(`  Profile Completeness: ${Math.round(ats.completenessScore)}/100`);
    if (ats.warnings.length > 0) lines.push(`\nWarnings: ${ats.warnings.slice(0, 3).join("; ")}`);
    if (ats.suggestions.length > 0) lines.push(`\nTop Suggestions: ${ats.suggestions.slice(0, 3).join("; ")}`);
    lines.push("\n=== END ATS ANALYSIS ===");
    return lines.join("\n");
}

export function buildJDContextBlock(jobDescription: string): string {
    if (!jobDescription || jobDescription.trim().length < 20) return "";
    return [
        "=== TARGET JOB DESCRIPTION (provided by candidate) ===",
        "(Use this to answer questions about role fit — do not claim the candidate has skills not present in their resume.)",
        "",
        jobDescription.substring(0, 2000),
        "\n=== END JOB DESCRIPTION ===",
    ].join("\n");
}

export function trimConversationHistory(messages: ChatMessage[], maxTurns: number = 8): ChatMessage[] {
    const maxMessages = maxTurns * 2;
    if (messages.length <= maxMessages) return messages;
    return messages.slice(messages.length - maxMessages);
}

export function hasResumeContent(resume: Resume): boolean {
    return !!(resume.personalInfo.fullName || resume.experience.length > 0 || resume.skills.length > 0 || resume.projects.length > 0);
}

Constraints:
- Only frontend/lib/promptTemplates.ts and frontend/lib/careerCoachService.ts are touched.
- No existing export in promptTemplates.ts is changed.
- No UI component, API route, or dashboard page is created or modified today.
- Run npm run build and confirm zero TypeScript errors.
- Run npx tsx tests/atsBenchmark.test.ts and npx tsx tests/optimizerSafety.test.ts and confirm both pass.
- Report the exact diff for both files.
```

## Testing
```bash
cd frontend
npm run build                              # TypeScript validates new exports
npx tsx tests/atsBenchmark.test.ts        # must still pass
npx tsx tests/optimizerSafety.test.ts     # must still pass
```

## Regression Testing
Both existing test suites must pass unchanged. Day 1 makes no changes to `atsEngine.ts`, `atsAnalyzer.ts`, `jdMatcher.ts`, or any optimizer logic.

## Manual Verification
- `buildResumeContextBlock` called with a populated `defaultResume` from `lib/defaultResume.ts` should return a non-empty string containing the candidate's name and skills.
- `buildResumeContextBlock` called with a resume where only `id` and `title` are set (no name, no experience, no skills) should return an empty string.
- `trimConversationHistory` with 20 messages and `maxTurns=8` should return the last 16 messages.
- `CAREER_COACH_SYSTEM_PROMPT` contains `"NEVER invent skills"` and the `HALLUCINATION_GUARDRAIL` text.

## Expected Behaviour
`npm run build` passes with zero errors. Existing test suites pass. The two new modules exist and export their functions and types correctly.

## Failure Cases
- TypeScript error on `HALLUCINATION_GUARDRAIL` in the system prompt array — confirm it's imported at the top of `promptTemplates.ts` (it's already defined as an export in the same file, no import needed).
- `buildResumeContextBlock` throws on undefined fields — guard with optional chaining (`?.`) and array length checks, all of which are in the implementation above.

## Debugging Guidance
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: "Module not found: @/types/resume" in careerCoachService.ts | Path alias not configured correctly for a lib file | Confirm `tsconfig.json` has `"@/*": ["./src/*"]` or `"@/*": ["./*"]` — check how other lib files import types |
| `CAREER_COACH_SYSTEM_PROMPT` produces a string with undefined in it | `HALLUCINATION_GUARDRAIL` is referenced before it's defined in the file | Move the new exports below the existing `HALLUCINATION_GUARDRAIL` definition — no re-ordering of existing code needed |

## Security Considerations
`lib/careerCoachService.ts` contains no secrets. It runs on the client. No sensitive data is logged or exposed. All strings it produces will be sent to the server API route, which validates auth before forwarding to OpenRouter.

## Checklist
- [ ] `lib/promptTemplates.ts` and `types/resume.ts` and `lib/atsAnalyzer.ts` read before editing
- [ ] `CAREER_COACH_MODEL_PARAMS` added to `promptTemplates.ts`
- [ ] `CAREER_COACH_SYSTEM_PROMPT` added, containing all truth-preservation rules and `HALLUCINATION_GUARDRAIL`
- [ ] No existing export in `promptTemplates.ts` was modified
- [ ] `lib/careerCoachService.ts` created with all type definitions and helper functions
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Both existing test suites pass
- [ ] No UI, no API route, no Firestore changes today

## Commit Message
```
feat(career-coach): add coach system prompt, model params, and careerCoachService helpers
```

## Documentation Updates
- `docs/02_Architecture.md` — add `lib/careerCoachService.ts` and new `promptTemplates.ts` exports to the architecture description
- `docs/20_Decision_Log.md` — log the architecture decision: stateless API + client-side state, no streaming yet (streaming introduced Day 2), no Firestore persistence in Sprint 6
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 1 entry

## End-of-Day Review
The foundational library for the Career Coach exists as pure, testable TypeScript. The system prompt establishes the Coach's identity, truth-preservation rules, and context-labelling conventions. All helper functions (`buildResumeContextBlock`, `buildATSContextBlock`, `buildJDContextBlock`, `trimConversationHistory`, `hasResumeContent`) are ready to be used by the API route (Day 2) and the UI (Days 3–7).

## Tomorrow Preview
Day 2 creates `app/api/career-coach/route.ts` — the authenticated, streaming Career Coach API endpoint. It follows the same `verifyAuth()` + `OPENROUTER_API_KEY` pattern as existing routes, but introduces streaming for the first time in this codebase, using native `ReadableStream` (no new dependencies).
