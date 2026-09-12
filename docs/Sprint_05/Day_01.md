# Sprint 5 — Day 1: Optimizer Architecture — Optimization Modes & Centralized Prompt Templates

## Objective
Turn the current single-action "improve this text" call into a structured, mode-aware optimization system. This is the architectural foundation Sprint 5's Days 2–5 build on.

## Why This Day Exists
The current `/api/ai-improve` route does one thing: rewrite a section. It picks a prompt based on `section` type, appends optional JD context, and returns plain improved text. There are no **optimization goals** — the user cannot say "make this more concise" vs "strengthen the action verbs" vs "align this to the job description." Every rewrite uses the same strategy regardless of what the user actually needs.

Sprint 5 introduces **optimization modes** — distinct rewrite strategies that change both the prompt instruction and the tone of the output. Each mode must have a clear, non-overlapping purpose so the system doesn't become a menu of paraphrasers.

This day also moves section-level prompt strings from inline `if/else` chains in `route.ts` into `promptTemplates.ts`, making them testable, version-controlled, and reusable.

## Repository Evidence / Current State

From reading `app/api/ai-improve/route.ts`:
- Prompt selection is a 5-branch `if/else if` chain on `section` — all inline, not exported
- `promptTemplates.ts` currently exports: personas, guardrails, format constants, model params — but zero section prompts
- `lib/aiService.ts`'s `improveSection()` signature: `(section, content, token, jobDescription?)`  — no `mode` parameter
- `AIImprovementModal.tsx` receives: `originalText`, `improvedText`, `isImproving` — no mode indicator

The route accepts `mode?: string` via the body today (we add this); the modal will display it from Day 4.

## Concepts
- **Optimization modes vs. sections:** Section (`experience`, `summary`, etc.) tells the optimizer *what kind of content* it's working with. Mode tells it *what goal* to optimize for. These are orthogonal — you can apply "Improve Impact" mode to an experience description just as easily as to a project description.
- **Mode-aware prompt composition:** Each mode contributes a goal-specific instruction clause that prepends or replaces the section's base rewriting instruction. The section context (what the content represents) and the mode goal (how to transform it) combine into a single coherent prompt.
- **Non-fabrication as a first-class constraint in every mode:** No mode — not even "Add Impact" — permits the AI to invent metrics, companies, technologies, or outcomes. Each mode prompt explicitly reinforces this. The `HALLUCINATION_GUARDRAIL` constant from `promptTemplates.ts` is appended to every composed prompt.

## Prerequisites
- Sprint 4 complete; `npm run build` succeeds; `npx tsx tests/atsBenchmark.test.ts` passes.
- Read `lib/promptTemplates.ts` in full to understand current exports before adding to them.
- Read `app/api/ai-improve/route.ts` in full — the entire route is being modified today.
- Read `lib/aiService.ts` — the function signature is being extended.

## Setup
No new packages. No new environment variables.

```bash
cd frontend
npm run build   # confirm clean baseline before any changes
```

## Resources
- `lib/promptTemplates.ts` — extended today
- `app/api/ai-improve/route.ts` — refactored today
- `lib/aiService.ts` — signature extended today

## Files to Modify
- `frontend/lib/promptTemplates.ts` — add `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`, `OptimizerMode` type, `buildOptimizerPrompt()` composer function
- `frontend/app/api/ai-improve/route.ts` — accept `mode` parameter, use `buildOptimizerPrompt()` instead of inline `if/else`
- `frontend/lib/aiService.ts` — add `mode?: OptimizerMode` parameter

## Architecture Impact
`buildOptimizerPrompt()` becomes the single source of truth for all AI improvement prompt construction. The route becomes a thin validation + auth wrapper that delegates prompt composition to `promptTemplates.ts`. Adding a new mode in future sprints requires only a new entry in `OPTIMIZER_MODE_PROMPTS` — no route logic changes.

## Data Flow
```
User (future Day 4) → selects mode in AIImprovementModal
→ calling form passes mode to aiService.improveSection(section, content, token, jd, mode)
→ aiService sends { section, content, mode, jobDescription } to POST /api/ai-improve
→ route validates section + mode
→ calls buildOptimizerPrompt(section, content, mode, jobDescription)
→ sends to OpenRouter with existing model params
→ returns { improvedContent: string }
```
Today implements from `buildOptimizerPrompt` inward. The calling form UX changes (mode selector) come in Day 4.

## Safety / Hallucination Constraints
- `HALLUCINATION_GUARDRAIL` must be appended to every built prompt — enforced inside `buildOptimizerPrompt()`, not the caller
- The "Improve Impact" mode must explicitly say: "If the content contains a specific number or percentage, preserve it exactly. If no metric exists, improve the phrasing to be outcome-oriented without fabricating one."
- The "JD Align" mode must explicitly say: "Do not add skills, technologies, or experiences the candidate has not mentioned. Only adjust emphasis and terminology for skills and experiences that are already present."

## Implementation Plan

### Step 1 — Add to `lib/promptTemplates.ts`

Add after the existing model param exports:

```typescript
// Optimization mode type — used by api/ai-improve and aiService
export type OptimizerMode = "ats" | "impact" | "concise" | "action-verbs" | "jd-align";

// Section-level base instructions (what the content represents)
export const SECTION_BASE_PROMPTS: Record<string, string> = {
  summary: "Rewrite the professional summary to be concise (max 80 words), ATS-optimized, achievement-driven, and impactful. Preserve all factual information and the candidate's actual career focus.",
  experience: "Rewrite the experience content using strong professional language. Preserve all company names, job titles, dates, and factual responsibilities. Do not invent new responsibilities or metrics.",
  projects: "Rewrite the project description to emphasize technical clarity and outcomes. Preserve all technology names, project names, and any actual metrics present. Do not fabricate results.",
  achievements: "Rewrite this achievement entry using strong, specific language. Preserve the exact title of the award or achievement. Do not invent metrics or outcomes not already stated.",
  certifications: "Provide a single professional sentence describing what this certification demonstrates to a recruiter — its relevance and the skill it validates. Do not modify the certification name, issuer, or year.",
};

// Mode-level goal instructions (how to transform it)
export const OPTIMIZER_MODE_PROMPTS: Record<OptimizerMode, string> = {
  "ats": "Optimization goal: improve ATS keyword richness by naturally integrating industry-standard terminology. Only use skills and technologies that are already mentioned or clearly implied by the existing content. Do not add new skills.",
  "impact": "Optimization goal: make the content more outcome-oriented and results-focused. If a specific metric (number, percentage, dollar amount) is already present, preserve it exactly. If no metric exists, improve the phrasing to be outcome-oriented WITHOUT fabricating one. Suggest a metric as a separate comment only if appropriate.",
  "concise": "Optimization goal: reduce word count by 20-30% while preserving all key information. Eliminate filler phrases, redundant adjectives, and passive voice. Every word must earn its place.",
  "action-verbs": "Optimization goal: replace weak or passive verbs with strong, specific action verbs appropriate to the professional level. Preserve all factual content, companies, dates, and technologies. Do not change meaning — only strengthen the verbs.",
  "jd-align": "Optimization goal: naturally align terminology and emphasis with the provided job description. Only adjust emphasis and wording for skills and experiences ALREADY PRESENT in the content. Do NOT add skills, technologies, companies, or experiences the candidate has not mentioned. This is terminology alignment, not fabrication.",
};

// Compose the full user prompt from section + mode + content + optional JD
export function buildOptimizerPrompt(
  section: string,
  content: string,
  mode: OptimizerMode | undefined,
  jobDescription?: string
): string {
  const baseInstruction = SECTION_BASE_PROMPTS[section] ?? `Rewrite this ${section} content professionally.`;
  const modeInstruction = mode ? OPTIMIZER_MODE_PROMPTS[mode] : "";
  
  let prompt = baseInstruction;
  if (modeInstruction) {
    prompt += `\n\n${modeInstruction}`;
  }
  
  // JD context appended only for jd-align mode or when explicitly provided
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdHeader = mode === "jd-align" 
      ? "Job Description (align terminology to this role — do not add missing skills):"
      : "Target Job Context (for context only — do not add missing skills):";
    prompt += `\n\n${jdHeader}\n${jobDescription.substring(0, 1000)}`;
  }
  
  prompt += `\n\n${HALLUCINATION_GUARDRAIL}`;
  prompt += `\n\nContent to optimize:\n${content}`;
  
  return prompt;
}
```

### Step 2 — Refactor `app/api/ai-improve/route.ts`

Replace the entire `if/else if` prompt-building section with:

```typescript
import { verifyAuth } from "@/lib/verifyAuth";
import {
  RESUME_OPTIMIZER_PERSONA,
  OUTPUT_FORMAT_PLAIN,
  HALLUCINATION_GUARDRAIL,
  AI_IMPROVE_MODEL_PARAMS,
  OptimizerMode,
  buildOptimizerPrompt
} from "@/lib/promptTemplates";

// ... (existing auth, API key check) ...

const { section, content, jobDescription, mode } = body;

// Validate mode (optional — defaults to undefined = base section rewrite)
const validModes: OptimizerMode[] = ["ats", "impact", "concise", "action-verbs", "jd-align"];
if (mode !== undefined && !validModes.includes(mode as OptimizerMode)) {
  return NextResponse.json({ error: "Invalid optimization mode specified." }, { status: 400 });
}

// JD required for jd-align mode
if (mode === "jd-align" && (!jobDescription || jobDescription.trim().length < 20)) {
  return NextResponse.json(
    { error: "A job description is required for JD Align optimization mode." },
    { status: 400 }
  );
}

const userPrompt = buildOptimizerPrompt(section, content, mode as OptimizerMode | undefined, jobDescription);
```

Remove the old 5-branch `if/else if` block entirely. The rest of the route (OpenRouter call, error handling, response) is unchanged.

### Step 3 — Extend `lib/aiService.ts`

Add `mode?: OptimizerMode` to the import and function signature:

```typescript
import { OptimizerMode } from "@/lib/promptTemplates";

export async function improveSection(
    section: "summary" | "experience" | "projects" | "achievements" | "certifications",
    content: string,
    token: string,
    jobDescription?: string,
    mode?: OptimizerMode
): Promise<string> {
    // ... existing cooldown + abort logic unchanged ...
    
    body: JSON.stringify({
        section,
        content,
        ...(jobDescription ? { jobDescription } : {}),
        ...(mode ? { mode } : {}),   // add this line
    }),
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 5, Day 1: Optimizer Architecture.

I am modifying three files today. No other files should be touched.
- frontend/lib/promptTemplates.ts
- frontend/app/api/ai-improve/route.ts
- frontend/lib/aiService.ts

Current state (confirmed by reading the actual code):
1. frontend/lib/promptTemplates.ts currently exports personas, guardrails, format constants, and model params — zero section prompts or optimization modes.
2. frontend/app/api/ai-improve/route.ts builds prompts via an inline 5-branch if/else if chain on the `section` field. There is no `mode` parameter.
3. frontend/lib/aiService.ts's improveSection() signature is: (section, content, token, jobDescription?) — no mode parameter.

Task — Change 1: Extend frontend/lib/promptTemplates.ts by adding after the existing model params:

export type OptimizerMode = "ats" | "impact" | "concise" | "action-verbs" | "jd-align";

export const SECTION_BASE_PROMPTS: Record<string, string> = {
  summary: "Rewrite the professional summary to be concise (max 80 words), ATS-optimized, achievement-driven, and impactful. Preserve all factual information and the candidate's actual career focus.",
  experience: "Rewrite the experience content using strong professional language. Preserve all company names, job titles, dates, and factual responsibilities. Do not invent new responsibilities or metrics.",
  projects: "Rewrite the project description to emphasize technical clarity and outcomes. Preserve all technology names, project names, and any actual metrics present. Do not fabricate results.",
  achievements: "Rewrite this achievement entry using strong, specific language. Preserve the exact title of the award or achievement. Do not invent metrics or outcomes not already stated.",
  certifications: "Provide a single professional sentence describing what this certification demonstrates to a recruiter — its relevance and the skill it validates. Do not modify the certification name, issuer, or year.",
};

export const OPTIMIZER_MODE_PROMPTS: Record<OptimizerMode, string> = {
  "ats": "Optimization goal: improve ATS keyword richness by naturally integrating industry-standard terminology for skills and technologies that are already mentioned or clearly implied by the existing content. Do not add new skills.",
  "impact": "Optimization goal: make the content more outcome-oriented and results-focused. If a specific metric (number, percentage, dollar amount) is already present in the content, preserve it exactly as written. If no metric exists, improve the phrasing to be outcome-oriented WITHOUT fabricating one.",
  "concise": "Optimization goal: reduce word count by approximately 20-30% while preserving all key information. Eliminate filler phrases, redundant adjectives, and passive voice constructions.",
  "action-verbs": "Optimization goal: replace weak or passive verbs (e.g. 'helped', 'worked on', 'was responsible for', 'assisted') with strong, specific action verbs appropriate to the professional level described. Preserve all factual content, company names, dates, and technologies exactly.",
  "jd-align": "Optimization goal: naturally align terminology and emphasis with the provided job description. Only adjust emphasis and wording for skills and experiences ALREADY PRESENT in the content. Do NOT add skills, technologies, companies, or experiences the candidate has not mentioned. This is terminology alignment, not content fabrication.",
};

export function buildOptimizerPrompt(
  section: string,
  content: string,
  mode: OptimizerMode | undefined,
  jobDescription?: string
): string {
  const baseInstruction = SECTION_BASE_PROMPTS[section] ?? `Rewrite this ${section} content professionally.`;
  const modeInstruction = mode ? OPTIMIZER_MODE_PROMPTS[mode] : "";
  let prompt = baseInstruction;
  if (modeInstruction) {
    prompt += `\n\n${modeInstruction}`;
  }
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdHeader = mode === "jd-align"
      ? "Job Description (align terminology to this role — do not add missing skills):"
      : "Target Job Context (for context only — do not add missing skills):";
    prompt += `\n\n${jdHeader}\n${jobDescription.substring(0, 1000)}`;
  }
  prompt += `\n\n${HALLUCINATION_GUARDRAIL}`;
  prompt += `\n\nContent to optimize:\n${content}`;
  return prompt;
}

Task — Change 2: Refactor frontend/app/api/ai-improve/route.ts.
1. Update the import from "@/lib/promptTemplates" to add: OptimizerMode, buildOptimizerPrompt (alongside existing imports).
2. In the request body destructure, add `mode` alongside the existing `section`, `content`, `jobDescription`.
3. After the existing `validSections` check, add:
   const validModes: OptimizerMode[] = ["ats", "impact", "concise", "action-verbs", "jd-align"];
   if (mode !== undefined && !validModes.includes(mode as OptimizerMode)) {
     return NextResponse.json({ error: "Invalid optimization mode specified." }, { status: 400 });
   }
   if (mode === "jd-align" && (!jobDescription || jobDescription.trim().length < 20)) {
     return NextResponse.json({ error: "A job description is required for JD Align optimization mode." }, { status: 400 });
   }
4. Replace the entire 5-branch if/else if prompt-building block (starting from `let userPrompt = ""` through the final `if (jobDescription ...)` append) with:
   const userPrompt = buildOptimizerPrompt(section, content, mode as OptimizerMode | undefined, jobDescription);
5. The system prompt message, OpenRouter fetch call, error handling, and response format ({improvedContent}) are all unchanged.
6. Confirm: the HALLUCINATION_GUARDRAIL is now only inside buildOptimizerPrompt() — do not also add it to the system prompt separately (it's already in RESUME_OPTIMIZER_PERSONA's composition via the system prompt). Actually, keep the system prompt exactly as it is — buildOptimizerPrompt appends the guardrail to the user prompt, which provides dual-layer protection.

Task — Change 3: Update frontend/lib/aiService.ts.
1. Add import at the top: import { OptimizerMode } from "@/lib/promptTemplates";
2. Add mode?: OptimizerMode as the 5th parameter after jobDescription?.
3. In the fetch body JSON.stringify, add: ...(mode ? { mode } : {}) alongside the existing jobDescription spread.
4. No other changes to aiService.ts.

Constraints:
- Only these three files are modified.
- The response shape { improvedContent: string } is unchanged.
- All existing validation (content length, section validity, jobDescription length) is preserved.
- The verifyAuth() call and all error handling branches are unchanged.
- The HALLUCINATION_GUARDRAIL constant content is not changed.
- Run npm run build and confirm zero TypeScript errors.
- Report the exact diff of all three files.
```

## Automated Testing
```bash
cd frontend
npm run build   # must succeed — TypeScript validates OptimizerMode type usages
```

Manual API test with no mode (backward compatibility):
```bash
# From browser console while logged in:
const token = await firebase.auth().currentUser.getIdToken();
const r = await fetch("/api/ai-improve", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  body: JSON.stringify({ section: "experience", content: "Worked on backend APIs." })
});
console.log(await r.json()); // must return { improvedContent: "..." }
```

Manual API test with mode:
```bash
body: JSON.stringify({ section: "experience", content: "Worked on backend APIs.", mode: "action-verbs" })
# must return { improvedContent: "..." } with stronger verbs
```

Invalid mode test:
```bash
body: JSON.stringify({ section: "experience", content: "Worked on backend APIs.", mode: "invalid-mode" })
# must return 400 with { error: "Invalid optimization mode specified." }
```

JD-align without JD test:
```bash
body: JSON.stringify({ section: "summary", content: "Software developer.", mode: "jd-align" })
# must return 400 with { error: "A job description is required for JD Align optimization mode." }
```

## Manual Testing
1. Open `/dashboard/builder`, add experience description, click the ✨ sparkle button — confirm it still works (no-mode backward compat).
2. No visible UI change expected today — mode selector comes in Day 4.

## Verification
- `npm run build` passes with zero TypeScript errors
- `npx tsx tests/atsBenchmark.test.ts` still passes (unchanged files)
- Existing AI improve buttons on PersonalInfoForm, ExperienceForm, ProjectsForm still function identically
- `buildOptimizerPrompt("experience", "Worked on APIs.", "action-verbs")` produces a prompt containing both the base section instruction and the action-verbs goal instruction

## Edge Cases
- `mode = undefined` (existing callers that don't pass mode): `buildOptimizerPrompt` uses `""` for modeInstruction — only the base section instruction runs. Identical to current behavior.
- `mode = "jd-align"` with `jobDescription = ""`: returns 400 (explicit guard added today).
- Section not in `SECTION_BASE_PROMPTS` (e.g., a future section type): falls back to `\`Rewrite this ${section} content professionally.\`` — safe, not a crash.

## Debugging Guide
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript: `OptimizerMode` not found in aiService | Import not added | Add `import { OptimizerMode } from "@/lib/promptTemplates"` at top of aiService.ts |
| Route returns 500 on valid request post-refactor | `buildOptimizerPrompt` not found in route import | Confirm all three new exports are in the import statement from promptTemplates |
| Existing AI buttons break (return empty content) | Old if/else block partially removed leaving no prompt | Confirm the entire old block (from `let userPrompt = ""` to the JD append) is replaced by the single `buildOptimizerPrompt` call |

## Checklist
- [ ] `lib/promptTemplates.ts` read in full before editing
- [ ] `OptimizerMode`, `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`, `buildOptimizerPrompt` added
- [ ] `HALLUCINATION_GUARDRAIL` appended inside `buildOptimizerPrompt` — not duplicated elsewhere
- [ ] `api/ai-improve/route.ts` uses `buildOptimizerPrompt` — old if/else block removed
- [ ] Mode validation (invalid mode → 400, jd-align without JD → 400) added to route
- [ ] `lib/aiService.ts` updated with `mode?: OptimizerMode` parameter
- [ ] `npm run build` succeeds
- [ ] Backward compatibility confirmed — existing buttons still work without mode param
- [ ] No other files modified

## Commit Message
```
feat(optimizer): introduce optimization modes and centralize section prompts in promptTemplates
```

## Documentation Updates
- `docs/05_Prompt_Library.md` — add Sprint 5 Day 1 entry
- `docs/20_Decision_Log.md` — log "Introduce optimization modes" decision with rationale
- `docs/25_Backlog.md` — mark Day 1 items In Progress → Done

## End-of-Day Review
The AI improvement system now has a proper architecture: section base prompts and mode goal prompts live in a centralized, testable module. The route is a thin validator and dispatcher. Five optimization modes are defined and validated. Existing functionality is entirely backward compatible — callers that don't pass a mode get the same base-section rewrite as before.

## Tomorrow Preview
Day 2 adds AI improve buttons to `AchievementsForm.tsx` and `CertificationsForm.tsx` — two forms the API already supports (added in Sprint 3) but that have no ✨ button in the UI. Both follow the exact same pattern as the existing `ExperienceForm.tsx` and `ProjectsForm.tsx`.
