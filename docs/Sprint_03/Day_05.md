# Sprint 3 — Day 5: Centralize Prompt Architecture & Fix AI Insights System Prompt

## Objective
The five API routes (`ai-improve`, `ai-insights`, `jd-refine`, `cover-letter`, `parse-pdf`) all construct their prompts inline, directly inside each route handler. Reading the actual code confirms two problems this creates:

1. **`api/ai-insights/route.ts` has no system prompt.** The entire prompt (instructions, resume text, JD text, ATS breakdown) is sent as a single `role: "user"` message. Every other route that needs model behavior control uses a separate `role: "system"` message to set expectations (hallucination prevention, output format, response style). Without a system prompt, the insights endpoint has no guardrail against verbose, generic, or hallucinated advice — it's the most user-visible output on the analyzer page and deserves the same discipline as the other routes.

2. **Prompt strings are scattered and duplicated across files.** The hallucination-prevention instruction ("Do NOT invent numbers, metrics, companies, achievements, or technologies that are not present in the original content") appears in `ai-improve`. A similar intent exists in `jd-refine` ("Do NOT invent skills. Do NOT fabricate missing qualifications.") but with different wording. The output-format instruction ("No markdown. No explanations.") appears in three routes with slight variations. This drift means fixing a prompt behavior requires finding and editing multiple files — and they can fall out of sync.

Today creates `lib/promptTemplates.ts` as the single source of truth for all prompt strings in the codebase, migrates the `ai-insights` and `ai-improve` routes to use it, and adds a proper system prompt to `ai-insights`. The `cover-letter` and `jd-refine` routes are partially aligned but their prompts are more complex and unique — they get their shared constants extracted without a full rewrite of their specific logic.

## Concepts
- **System prompt vs. user prompt separation:** In OpenRouter/OpenAI-compatible APIs, the `system` role sets persistent behavior constraints (persona, guardrails, output format) that the model is less likely to override in response to user content. Putting behavioral instructions only in the user message means a user who embeds "ignore all previous instructions" in their resume text has a higher chance of affecting the output. A proper system message is the primary defense against this — not foolproof, but meaningfully better.
- **Prompt template module design:** The simplest correct design is exported constant strings (not functions, not template engines). Where a prompt needs variable substitution, it stays in the route handler as a template literal referencing the imported constants — this keeps the template module as pure text without runtime dependencies.
- **Don't over-centralize on Day 5.** The `cover-letter` route has 5 distinct, complex prompt variants — fully extracting and stabilizing all of them would take a full day. Today: extract the shared constants (hallucination guardrail, output format instructions, persona description) and the `ai-insights` system prompt. Leave the unique per-action cover letter prompts inline for now, with a comment pointing to `promptTemplates.ts` for the shared parts.

## Prerequisites
- Days 1–4 complete; build succeeds.
- Read all five route files (`ai-improve`, `ai-insights`, `jd-refine`, `cover-letter`, `parse-pdf`) in full to identify shared strings and the missing system prompt in `ai-insights`.
- Confirm: `lib/promptTemplates.ts` does **not** yet exist in the repository.

## Setup
No new packages required.

## Resources
- `app/api/ai-insights/route.ts` — primary file with the missing system prompt.
- `app/api/ai-improve/route.ts` — reference for the existing system prompt pattern to replicate.
- `app/api/jd-refine/route.ts` — reference for the existing ATS-focus system prompt.
- OpenRouter system prompt docs: https://openrouter.ai/docs (same interface as OpenAI — system role in messages array).

## Files to Modify
- New: `frontend/lib/promptTemplates.ts` — created today.
- `frontend/app/api/ai-insights/route.ts` — add system prompt; import shared constants.
- `frontend/app/api/ai-improve/route.ts` — import and use shared constants (system prompt text).
- `frontend/app/api/jd-refine/route.ts` — import shared ATS persona constant.
- `frontend/app/api/cover-letter/route.ts` — import shared hallucination-guardrail constant; add a comment pointing to `promptTemplates.ts` for the persona description.

## Architecture Impact
`lib/promptTemplates.ts` becomes a new shared module in the `lib/` directory. All API routes that import from it do so via `import { ... } from "@/lib/promptTemplates"`. No route's external API behavior changes (same model, same endpoint, same response shape) — only the internal prompt text is sourced from a central file. This is a refactor of prompt source location, not prompt behavior.

## Implementation Plan
1. Read all five route files in full before writing `promptTemplates.ts`.
2. **Identify shared strings across routes:**
   - A "hallucination guardrail" instruction: consolidate the variations in `ai-improve` and `jd-refine` into one canonical version.
   - An "output format" instruction: no markdown, no preambles, output only the requested content.
   - A "resume optimization persona" string: used in `ai-improve` and applicable to `ai-insights`.
   - An "ATS expert persona" string: used in `jd-refine` and applicable to `ai-insights`.
3. **Create `lib/promptTemplates.ts`** with these exports:
   ```typescript
   // Shared persona descriptions
   export const RESUME_OPTIMIZER_PERSONA = "You are a professional resume optimization assistant and career coach with deep expertise in ATS systems, recruiter behavior, and modern hiring practices.";
   export const ATS_EXPERT_PERSONA = "You are an expert ATS optimization specialist with deep knowledge of how Applicant Tracking Systems parse and score resumes.";

   // Shared behavioral guardrails
   export const HALLUCINATION_GUARDRAIL = "IMPORTANT: Do NOT invent, fabricate, or assume any information not explicitly present in the provided text. This includes: numbers, metrics, company names, job titles, technologies, certifications, achievements, or any factual claims. If something is not in the source material, do not add it.";
   export const OUTPUT_FORMAT_PLAIN = "Respond with only the requested output. No markdown formatting. No explanations of what you are doing. No preamble. No conversational filler.";
   export const OUTPUT_FORMAT_BULLETS = "Respond with only bullet points (* or -). No markdown headers. No explanations. No preamble. No conversational filler.";

   // AI Insights system prompt (full, not shared — specific to this route)
   export const AI_INSIGHTS_SYSTEM_PROMPT = `${RESUME_OPTIMIZER_PERSONA} ${ATS_EXPERT_PERSONA}

   You analyze resume text and ATS scoring breakdowns to provide targeted, specific, and actionable feedback. Your feedback must:
   - Be directly based on the provided resume text and ATS breakdown — never generic advice
   - Reference specific weaknesses identified in the breakdown scores
   - Suggest concrete actions (e.g., "Add 2-3 quantified achievements to your experience section" not "Improve your resume")
   - Never fabricate missing information or invent qualifications
   - Never suggest adding false experience, fake certifications, or invented metrics
   ${OUTPUT_FORMAT_BULLETS}`;
   ```
4. **Update `api/ai-insights/route.ts`:** Add `import { AI_INSIGHTS_SYSTEM_PROMPT } from "@/lib/promptTemplates"`. In the OpenRouter call's `messages` array, add `{ role: "system", content: AI_INSIGHTS_SYSTEM_PROMPT }` before the existing user message. Keep the user prompt content exactly as-is — only adding the system role is required.
5. **Update `api/ai-improve/route.ts`:** Import `HALLUCINATION_GUARDRAIL`, `OUTPUT_FORMAT_PLAIN`, and `RESUME_OPTIMIZER_PERSONA`. Replace the inline system prompt string with: `` `${RESUME_OPTIMIZER_PERSONA} ${OUTPUT_FORMAT_PLAIN} ${HALLUCINATION_GUARDRAIL}` ``. The content must match the original closely — compare before and after to ensure no behavioral regression.
6. **Update `api/jd-refine/route.ts`:** Import `ATS_EXPERT_PERSONA`, `HALLUCINATION_GUARDRAIL`, `OUTPUT_FORMAT_PLAIN`. Replace the inline system prompt with the imported constants composed together, matching the original's intent.
7. **Update `api/cover-letter/route.ts`:** Import `HALLUCINATION_GUARDRAIL` and `OUTPUT_FORMAT_PLAIN`. In the generate prompt's Instructions block (item 6: "Output ONLY the cover letter text..."), replace the inline "no markdown, no preamble" text with a reference to `OUTPUT_FORMAT_PLAIN`. Add `HALLUCINATION_GUARDRAIL` to the generate prompt. Add a comment at the top of the prompt block: `// System instructions via RESUME_OPTIMIZER_PERSONA from lib/promptTemplates.ts — future sprint`.
8. Run `npm run build`. Confirm zero errors.
9. **Full Sprint 3 regression pass:** Manually test all AI features that were touched across Days 1–5:
   - Resume Builder ATS score panel updates correctly for certifications and achievements.
   - Resume Analyzer Match score does not show artificial 35 floor.
   - Job Matcher shows meaningful section bars and weighted scores.
   - AI Improve works for all five sections including achievements and certifications.
   - AI Insights returns more specific, targeted feedback (subjective — compare a before/after result manually).
   - Cover letter generation still works.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). Today I am creating a new file and modifying four existing API route files as the final step of Sprint 3.

I have confirmed by reading the code:
1. frontend/lib/promptTemplates.ts does NOT exist — I am creating it today.
2. frontend/app/api/ai-insights/route.ts sends the entire prompt as a single role:"user" message with no role:"system" message — it is the only API route missing a system prompt.
3. The hallucination guardrail instruction ("Do NOT invent...") appears in ai-improve and jd-refine with different wording — these should share a canonical version.
4. Output format instructions ("No markdown...") appear across three routes with slight variations.

Task — Change 1: Create frontend/lib/promptTemplates.ts with exactly these exports:

export const RESUME_OPTIMIZER_PERSONA = "You are a professional resume optimization assistant and career coach with deep expertise in ATS systems, recruiter behavior, and modern hiring practices.";

export const ATS_EXPERT_PERSONA = "You are an expert ATS optimization specialist with deep knowledge of how Applicant Tracking Systems parse, score, and rank resumes.";

export const HALLUCINATION_GUARDRAIL = "IMPORTANT: Do NOT invent, fabricate, or assume any information not explicitly present in the provided text. This includes: numbers, metrics, company names, job titles, technologies, certifications, achievements, or any factual claims. If something is not in the source material, do not add it.";

export const OUTPUT_FORMAT_PLAIN = "Respond with only the requested output. No markdown formatting. No explanations of what you are doing. No preamble. No conversational filler.";

export const OUTPUT_FORMAT_BULLETS = "Respond with only bullet points using * or - symbols. No markdown headers. No numbered lists unless the instruction specifically asks for them. No preamble. No conversational filler.";

export const AI_INSIGHTS_SYSTEM_PROMPT = [
  RESUME_OPTIMIZER_PERSONA,
  ATS_EXPERT_PERSONA,
  "You analyze resume text and ATS scoring breakdowns to provide targeted, specific, and actionable improvement suggestions.",
  "Your feedback must: reference specific weaknesses from the provided ATS breakdown scores; suggest concrete, role-specific actions based on the actual resume text; never give generic advice that would apply to any resume.",
  HALLUCINATION_GUARDRAIL,
  OUTPUT_FORMAT_BULLETS
].join(" ");

Task — Change 2: Update frontend/app/api/ai-insights/route.ts:
- Add import: import { AI_INSIGHTS_SYSTEM_PROMPT } from "@/lib/promptTemplates";
- In the fetch body's messages array, ADD { role: "system", content: AI_INSIGHTS_SYSTEM_PROMPT } as the FIRST message, before the existing { role: "user", content: prompt } entry.
- Do not change the user prompt content, the request body shape, the response shape, or any other logic.

Task — Change 3: Update frontend/app/api/ai-improve/route.ts:
- Add import: import { RESUME_OPTIMIZER_PERSONA, HALLUCINATION_GUARDRAIL, OUTPUT_FORMAT_PLAIN } from "@/lib/promptTemplates";
- Replace the inline system prompt string ("You are a professional resume optimization assistant...") with: `${RESUME_OPTIMIZER_PERSONA} ${OUTPUT_FORMAT_PLAIN} ${HALLUCINATION_GUARDRAIL}`
- Confirm the composed string preserves the same behavioral intent as the original (no fabrication, no markdown, output only the improved content).

Task — Change 4: Update frontend/app/api/jd-refine/route.ts:
- Add import: import { ATS_EXPERT_PERSONA, HALLUCINATION_GUARDRAIL, OUTPUT_FORMAT_PLAIN } from "@/lib/promptTemplates";
- Replace the inline system prompt content with: `${ATS_EXPERT_PERSONA} ${HALLUCINATION_GUARDRAIL} ${OUTPUT_FORMAT_PLAIN} Provide actionable but factual suggestions. Respond in structured paragraphs.`
- The last sentence ("Respond in structured paragraphs.") is specific to this route and stays inline — do not move it to promptTemplates.ts.

Task — Change 5: Update frontend/app/api/cover-letter/route.ts:
- Add import: import { HALLUCINATION_GUARDRAIL, OUTPUT_FORMAT_PLAIN } from "@/lib/promptTemplates";
- In the generate action's prompt string: replace the line "6. Output ONLY the cover letter text. No markdown, no preambles, no conversational filler." with: `6. ${OUTPUT_FORMAT_PLAIN}`
- Append HALLUCINATION_GUARDRAIL as instruction item 7 in the generate prompt's Instructions block: `7. ${HALLUCINATION_GUARDRAIL}`
- Add a comment above the generate prompt block: // Persona: see RESUME_OPTIMIZER_PERSONA in lib/promptTemplates.ts — to be integrated in a future sprint
- Do not change the improve/shorten/impactful action prompts today.

Constraints:
- Only these five files are touched: lib/promptTemplates.ts (new), api/ai-insights/route.ts, api/ai-improve/route.ts, api/jd-refine/route.ts, api/cover-letter/route.ts.
- No route's external API behavior (request body shape, response body shape, model, HTTP method, authentication) changes.
- No other lib or component file is modified.
- Confirm npm run build succeeds after all changes.
- Report the exact diff of every file.
```

## Testing
**How to test:**

1. `npm run build` — must succeed with zero TypeScript errors. TypeScript will verify all imports from `promptTemplates.ts` resolve correctly.
2. `npm run dev`. Test every AI feature in sequence:

**AI Insights (primary focus today):**
   - Upload a resume to the Resume Analyzer. Run it in Quality mode. Click "Generate Insights".
   - Confirm insights are returned and are more specific/targeted than before (reference actual score breakdowns, not generic advice).
   - Run in Match mode with a job description. Confirm insights reference the specific job context.

**All other routes — confirm no regression:**
   - Resume Builder: AI Improve on a summary section → confirm response received.
   - JD Matcher → confirm JD refine insights still appear.
   - Cover Letter → confirm generation still works for all three actions (generate, improve, shorten).

3. **Full Sprint 3 regression checklist** (confirm every change from Days 1–4 is still working):
   - [ ] ATSScorePanel shows certifications bonus in `completenessScore` when a certification is added.
   - [ ] Resume Analyzer Match score goes below 35 for a clearly mismatched resume.
   - [ ] JD Matcher shows weighted section bars when resume is structured.
   - [ ] AI Improve returns a response for "achievements" section.
   - [ ] AI Improve returns a response for "certifications" section.
   - [ ] AI Insights returns specific, breakdown-referencing feedback (not generic).

**Expected result:** All AI features work correctly, the build is clean, and `lib/promptTemplates.ts` is the canonical source for all shared prompt strings in the codebase.

**Edge cases:**
- Confirm `AI_INSIGHTS_SYSTEM_PROMPT` renders as a single coherent string (the `.join(" ")` array pattern should work — verify the output doesn't have double spaces or line-break artifacts that could confuse the model).

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: Cannot find module '@/lib/promptTemplates' | File was created at wrong path (e.g., `frontend/lib/promptTemplates.ts` missing or mislabeled) | Confirm the file exists at exactly `frontend/lib/promptTemplates.ts` and exports match what's imported |
| AI Insights still returns generic advice after the system prompt addition | System prompt is too generic, or the user prompt isn't providing specific enough ATS data | Verify `atsBreakdown` is actually populated and non-null when passed in the request body — log it server-side temporarily if needed |
| Cover letter generation broken | The OUTPUT_FORMAT_PLAIN substitution changed the structure of the Instructions list | Compare the rendered prompt before and after — ensure instruction numbering is still sequential and the period/newlines are preserved |

## Checklist
- [ ] All five route files and `api/ai-insights/route.ts`, `api/ai-improve/route.ts`, `api/jd-refine/route.ts`, `api/cover-letter/route.ts` read before editing
- [ ] `lib/promptTemplates.ts` created with all required exports
- [ ] `ai-insights/route.ts` has system prompt as first message in messages array
- [ ] `ai-improve/route.ts` system prompt uses imported constants
- [ ] `jd-refine/route.ts` system prompt uses imported constants
- [ ] `cover-letter/route.ts` uses `OUTPUT_FORMAT_PLAIN` and `HALLUCINATION_GUARDRAIL` for generate action
- [ ] `npm run build` succeeds
- [ ] Full Sprint 3 regression pass completed — all Days 1–5 features verified together
- [ ] Sprint 3 documentation finalized

## Commit Message
```
feat(prompt-arch): centralize prompt templates, add system prompt to ai-insights, align all routes
```

## Documentation Update
- `docs/01_Master_Roadmap.md` — mark Sprint 3 ✅ Complete with actual outcome note.
- `docs/25_Backlog.md` — mark all Sprint 3 items Done; add deferred items if any arose this sprint.
- `docs/02_Architecture.md` — add `lib/promptTemplates.ts` to the architecture description under "Shared Library Modules".
- `docs/21_Tech_Stack.md` — no change needed (no new technologies).
- `docs/05_Prompt_Library.md` — add Sprint 3 Day 1–5 entries to the index table.

---

# Sprint 3 Summary

## Sprint Goal
Transform HireLens from a "Resume Checker" into a "Resume Intelligence Platform" by improving the accuracy and quality of every AI and scoring layer — without adding new features, UI changes, or infrastructure.

## Deliverables

| Day | File(s) Changed | What Improved |
|---|---|---|
| Day 1 | `lib/atsAnalyzer.ts` | Certifications/achievements scored; keyword density computed; weak verbs aligned; skill level guidance added |
| Day 2 | `lib/atsEngine.ts` | Artificial 35-floor removed; bigram keyword extraction; improved quantification regex; date-range year inference |
| Day 3 | `lib/jdMatcher.ts` | Frequency-weighted keywords; required vs. preferred scoring; structured section match |
| Day 4 | `api/ai-improve/route.ts`, `lib/aiService.ts` | Achievements and certifications sections supported; optional JD context for targeted rewrites |
| Day 5 | `lib/promptTemplates.ts` (new), `api/ai-insights/route.ts`, `api/ai-improve/route.ts`, `api/jd-refine/route.ts`, `api/cover-letter/route.ts` | Centralized prompt architecture; system prompt added to ai-insights; hallucination guardrail standardized |

## Risks
- **Score changes may surprise users.** Removing the 35-point floor means users who previously saw "35/100" for a weak resume may now see "12/100". This is honest and correct — but worth watching for user feedback in the next sprint.
- **Bigram extraction changes the match score for existing resumes.** Resumes that were slightly below a match keyword threshold may now score higher due to bigram matching. This is an improvement — but users should be informed the score calculation is more sophisticated.
- **Prompt template centralization is a refactor of source location, not behavior.** However, any deviation from the original prompt text in the constant composition could subtly change AI behavior. The regression pass on Day 5 is critical.

## Definition of Done
- `npm run build` succeeds with zero TypeScript errors.
- All five AI features (improve, insights, jd-refine, cover letter, analyzer score) work end-to-end in the running app.
- The Resume Builder ATS score panel accounts for certifications and achievements.
- The Resume Analyzer Match mode produces scores below 35 for clearly mismatched resumes.
- The Job Matcher weights required skills more heavily than preferred skills.
- AI section improvement works for `achievements` and `certifications` sections.
- `lib/promptTemplates.ts` exists and is imported by at least three route files.
- Full Sprint 3 regression pass confirms all Day 1–5 changes work together without conflict.
- `docs/01_Master_Roadmap.md` marks Sprint 3 ✅ Complete.

## Exit Criteria
Sprint 3 is complete and Sprint 4 may be planned once:
1. The Definition of Done is independently verified by running the app and manually testing each item above.
2. The Day 5 full regression pass has been completed in a single session.
3. `docs/01_Master_Roadmap.md` shows Sprint 3 as ✅ Complete with a real "Actual Outcome" note.
4. `docs/25_Backlog.md` is updated to reflect what was done, what was deferred, and any new items that surfaced during Sprint 3.
