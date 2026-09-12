# Sprint 4 — Day 5: AI Route Quality — Prompt Cleanup, Token Control & Sprint 4 Close-Out

## Objective
Three confirmed code gaps in the AI routes, addressed today:

**Gap 1 — `api/ai-insights/route.ts:29` user prompt repeats system-prompt context:**
```typescript
const prompt = `
    You are an expert ATS optimizer and career coach.
    You have been given a candidate's resume...
```
The system prompt (`AI_INSIGHTS_SYSTEM_PROMPT` from `lib/promptTemplates.ts`) already establishes the persona and behavioral constraints. Repeating "You are an expert ATS optimizer and career coach" in the user message is redundant — it adds tokens without adding instruction clarity. The user message should be a clean data-and-task message only: "Here is the resume, here is the breakdown, provide improvement suggestions."

**Gap 2 — No `max_tokens` parameter on any AI route:**
All three routes (`ai-improve`, `ai-insights`, `jd-refine`) call OpenRouter with no `max_tokens` specified. The model can return arbitrarily long responses. For section improvement prompts (`ai-improve`) targeting a single resume bullet (< 2000 chars input), a 3000-token response is wasteful. For AI insights, 5 bullet points should not exceed 500 tokens. Specifying `max_tokens` controls cost, prevents verbose responses that overwhelm the UI, and makes response length consistent across runs.

**Gap 3 — No `temperature` parameter on any AI route:**
Temperature controls the randomness of LLM output. Without specifying it, the model uses its default (typically 1.0 on OpenRouter). For resume rewriting and ATS analysis — tasks requiring factual accuracy and consistent behavior — a lower temperature (0.3–0.4) is more appropriate: it produces more deterministic, less "creative" responses and reduces hallucination risk. This is especially important for `ai-improve`, where the model must not invent new information about the candidate.

Today also closes out Sprint 4 with the full regression pass.

## Concepts
- **`max_tokens` per route calibration:**
  - `ai-improve`: The output is a single rewritten section (summary, experience bullet, project description, achievement, or certification context). A well-written section is rarely more than 150–200 words. `max_tokens: 400` allows comfortable headroom without permitting runaway responses.
  - `ai-insights`: 3–5 concise bullet points. At ~30 words per bullet × 5 bullets = ~150 words. `max_tokens: 500` is generous.
  - `jd-refine`: Returns structured paragraphs of analysis. Slightly more verbose. `max_tokens: 700` allows 3–4 substantive paragraphs.
- **`temperature` per route calibration:**
  - `ai-improve`: `0.3` — low temperature for maximum consistency. The user will click "AI Improve" multiple times for different sections; they need predictable, not creative, output.
  - `ai-insights`: `0.4` — slightly higher to allow varied phrasing of feedback across different resumes, while still being controlled.
  - `jd-refine`: `0.4` — analysis benefits from controlled variation to surface different angles without being erratic.
- **Why these values are added to `lib/promptTemplates.ts`:** Centralizing model parameters (the same way prompt strings were centralized in Sprint 3) means a future model parameter change only requires editing one file. Each route imports constants rather than hardcoding magic numbers.

## Prerequisites
- Days 1–4 complete; build succeeds; benchmark passes.
- Read `app/api/ai-insights/route.ts` line 29 to confirm the duplicate persona in the user prompt.
- Confirm `lib/promptTemplates.ts` current exports (to know what's already there).
- Confirm `max_tokens` and `temperature` are absent from all three routes (confirmed in audit: zero grep hits).

## Setup
No new packages.

## Resources
- `app/api/ai-insights/route.ts` — primary file with the user prompt cleanup.
- `app/api/ai-improve/route.ts` — add `max_tokens` and `temperature`.
- `app/api/jd-refine/route.ts` — add `max_tokens` and `temperature`.
- `lib/promptTemplates.ts` — add model parameter constants.

## Files to Modify
- `frontend/lib/promptTemplates.ts` — add `AI_MODEL_PARAMS` constants.
- `frontend/app/api/ai-insights/route.ts` — clean user prompt, add model params.
- `frontend/app/api/ai-improve/route.ts` — add model params.
- `frontend/app/api/jd-refine/route.ts` — add model params.

## Architecture Impact
No interface or API contract changes. Model parameters are additive to the existing OpenRouter fetch body — they narrow response behavior but do not change what the endpoint accepts or returns. The `AI_MODEL_PARAMS` export in `promptTemplates.ts` follows the same centralization pattern established in Sprint 3.

## Implementation Plan

### Part 1 — Add model parameter constants to `lib/promptTemplates.ts`

After the last existing export, add:
```typescript
// Model parameter constants — centralized to avoid magic numbers scattered across routes
export const AI_IMPROVE_MODEL_PARAMS = {
    max_tokens: 400,
    temperature: 0.3,
};

export const AI_INSIGHTS_MODEL_PARAMS = {
    max_tokens: 500,
    temperature: 0.4,
};

export const AI_JD_REFINE_MODEL_PARAMS = {
    max_tokens: 700,
    temperature: 0.4,
};
```

### Part 2 — Clean `api/ai-insights/route.ts` user prompt

1. Find the `prompt` template literal starting at line ~27.
2. Remove the opening line: `"You are an expert ATS optimizer and career coach."` — it is already in `AI_INSIGHTS_SYSTEM_PROMPT`.
3. Remove the line: `"You have been given a candidate's resume text..."` — replace with a cleaner task framing: `"Analyze the following resume and ATS breakdown. Provide 3-5 concise, highly actionable bullet points targeting the weakest areas in the breakdown scores."`.
4. Keep all other content (resume text, JD if Match mode, atsBreakdown JSON, mode context) exactly as-is.
5. Import `AI_INSIGHTS_MODEL_PARAMS` from `promptTemplates.ts`.
6. In the OpenRouter fetch body, add: `...AI_INSIGHTS_MODEL_PARAMS,` (spread after `model`).

### Part 3 — Add model params to `api/ai-improve/route.ts`

1. Import `AI_IMPROVE_MODEL_PARAMS` from `promptTemplates.ts`.
2. In the OpenRouter fetch body (the `body: JSON.stringify({...})` call), add `...AI_IMPROVE_MODEL_PARAMS,` after `model`.

### Part 4 — Add model params to `api/jd-refine/route.ts`

1. Import `AI_JD_REFINE_MODEL_PARAMS` from `promptTemplates.ts`.
2. In the OpenRouter fetch body, add `...AI_JD_REFINE_MODEL_PARAMS,` after `model`.

### Part 5 — Full Sprint 4 regression pass

Run the complete verification sequence:
1. `npm run build` — must succeed.
2. `npx tsx tests/atsBenchmark.test.ts` — all four sections must pass.
3. Manual browser test of all AI features: AI Improve (for all 5 sections), AI Insights (Quality mode), AI Insights (Match mode), JD Refine.
4. Verify Sprint 4's Day 1 fix: JD Matcher section bars reflect actual resume content.
5. Verify Sprint 4's Day 2 fix: ATSScorePanel shows the Resume Intelligence section.
6. Verify Sprint 4's Day 3 fix: Quality mode impact and skills scores are graduated.
7. Verify Sprint 4's Day 4 fix: Short skill name false positives are eliminated.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). Today is the final day of Sprint 4. I am modifying four files: frontend/lib/promptTemplates.ts, frontend/app/api/ai-insights/route.ts, frontend/app/api/ai-improve/route.ts, and frontend/app/api/jd-refine/route.ts.

I have confirmed by reading the actual code:
1. frontend/app/api/ai-insights/route.ts line 29: the user prompt template literal opens with "You are an expert ATS optimizer and career coach." — this persona is already defined in AI_INSIGHTS_SYSTEM_PROMPT from lib/promptTemplates.ts which is used as the system role message. This line in the user message is redundant.
2. Zero of the three AI routes specify max_tokens or temperature in their OpenRouter fetch body JSON.

Task — Change 1: In frontend/lib/promptTemplates.ts, add after the final existing export:
export const AI_IMPROVE_MODEL_PARAMS = { max_tokens: 400, temperature: 0.3 };
export const AI_INSIGHTS_MODEL_PARAMS = { max_tokens: 500, temperature: 0.4 };
export const AI_JD_REFINE_MODEL_PARAMS = { max_tokens: 700, temperature: 0.4 };

Task — Change 2: In frontend/app/api/ai-insights/route.ts:
1. Import AI_INSIGHTS_MODEL_PARAMS from "@/lib/promptTemplates" (add to existing import line).
2. In the prompt template literal, remove: "You are an expert ATS optimizer and career coach." (the opening line of the prompt const).
3. Replace "You have been given a candidate's resume text, [isMatchMode ? ...] and their current ATS scoring breakdown based on a ${mode} mode analysis." with: "Analyze the following resume and ATS breakdown. Provide 3-5 concise, highly actionable improvement suggestions targeting the weakest areas shown in the ATS scoring breakdown."
4. Keep the rest of the prompt (Resume section, Job Description section if Match mode, ATS Score Breakdown section) exactly as-is — do not change resume text truncation, JD handling, or atsBreakdown serialization.
5. In the OpenRouter fetch body JSON for each model in the MODELS loop: add ...AI_INSIGHTS_MODEL_PARAMS after the model field. (The fetch call is inside the for...of loop — add the params to the body JSON inside the loop.)

Task — Change 3: In frontend/app/api/ai-improve/route.ts:
1. Add AI_IMPROVE_MODEL_PARAMS to the existing import from "@/lib/promptTemplates".
2. In the OpenRouter fetch body JSON: add ...AI_IMPROVE_MODEL_PARAMS after the model field.

Task — Change 4: In frontend/app/api/jd-refine/route.ts:
1. Add AI_JD_REFINE_MODEL_PARAMS to the existing import from "@/lib/promptTemplates".
2. In the OpenRouter fetch body JSON: add ...AI_JD_REFINE_MODEL_PARAMS after the model field.

Constraints:
- Only these four files are modified.
- No route's request body shape, response body shape, HTTP method, or authentication logic changes.
- The ai-insights route's multi-model fallback loop (iterating MODELS array) is not changed — only the fetch body inside the loop gets the model params spread added.
- The ai-improve route's system prompt string is not changed — only the model params are added.
- Report the exact diff of all four files.
- Confirm npm run build succeeds.
```

## Testing
**How to test:**
1. `npm run build` — must succeed with zero TypeScript errors.
2. `npm run dev`.
3. **AI Improve — response length test:** Use "AI Improve" on a project description. Before the fix, responses could be very long; after, they should be concise (under ~400 tokens / ~300 words). Verify in the `AIImprovementModal` that the improved content is appropriately brief.
4. **AI Insights — prompt cleanliness test:** Generate AI Insights in both Quality and Match modes. The response should be 3–5 bullet points, not a long essay. Previously, without `max_tokens`, the model occasionally returned verbose multi-paragraph explanations.
5. **JD Refine — structured paragraph test:** Use the JD Matcher's "Deep Alignment Analysis" feature. Response should be concise structured paragraphs (3–4), not an unbounded document.
6. **Full Sprint 4 regression pass:**

| Item | What to check | Expected |
|---|---|---|
| Day 1: JD section bars | Resume with React skill + JD mentioning React | Skills bar ≈ % of resume skills in JD, not bucket approximation |
| Day 2: Resume Intelligence | ATSScorePanel in Resume Builder | "Resume Intelligence" section visible with 3 bar rows |
| Day 3: Impact scoring | Quality mode, resume with 4 metrics | Impact & Metrics bar ≈ 80 (not 20 or 100) |
| Day 4: Short skills | Resume with skill "Go", exp description without "Go" | keywordDensityScore lower than if exp description contained "Go" |
| Day 5: AI response | Any AI feature | Responses are concise, not runaway length |

**Expected result:** All AI features produce consistently-length, appropriately-concise responses. Full Sprint 4 regression confirms all five days' work is stable.

**Edge cases:**
- `max_tokens: 400` in `ai-improve` might truncate a very long certification context sentence if the model tends to be verbose. If this happens in testing, increase to 500 — but verify first that truncation is actually occurring (check for `finish_reason: "length"` in the OpenRouter response, if logged).

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: `...AI_IMPROVE_MODEL_PARAMS` spread causes type error | OpenRouter fetch body type doesn't accept arbitrary keys | Cast the body as `any` or define an explicit interface — the OpenRouter API accepts both `max_tokens` and `temperature` per spec |
| AI Insights responses still very long | `max_tokens` not actually included in the request body | Log the request body temporarily to confirm the params are present |
| AI Improve returns truncated/incomplete content | `max_tokens: 400` too low for a particular section type | For experience sections, a single complex entry can be verbose; consider raising `AI_IMPROVE_MODEL_PARAMS.max_tokens` to 500 if truncation is observed |

## Checklist
- [ ] `lib/promptTemplates.ts` — three model param constants added
- [ ] `ai-insights/route.ts` — duplicate persona removed from user prompt; `AI_INSIGHTS_MODEL_PARAMS` spread into fetch body inside model loop
- [ ] `ai-improve/route.ts` — `AI_IMPROVE_MODEL_PARAMS` spread into fetch body
- [ ] `jd-refine/route.ts` — `AI_JD_REFINE_MODEL_PARAMS` spread into fetch body
- [ ] `npm run build` succeeds
- [ ] `npx tsx tests/atsBenchmark.test.ts` — all 4 sections pass
- [ ] Full Sprint 4 regression pass — all 5 day items manually verified in the browser
- [ ] Sprint 4 documentation finalized (Roadmap, Backlog, Risks updated)

## Commit Message
```
feat(ai-routes): add max_tokens and temperature to all AI routes; clean redundant persona from ai-insights user prompt
```

## Documentation Update
- `docs/01_Master_Roadmap.md` — mark Sprint 4 ✅ Complete with actual outcome note.
- `docs/25_Backlog.md` — mark all Sprint 4 Day 5 items Done; add any newly-discovered items for Sprint 5.
- `docs/05_Prompt_Library.md` — add Sprint 4 Day 1–5 entries.
- `docs/20_Decision_Log.md` — log the `max_tokens`/`temperature` decision and the rationale for each route's specific values.

---

# Sprint 4 Summary

## Sprint Goal
Transform HireLens from "Resume Intelligence Platform" into "Professional Recruiter-Level Resume Intelligence Platform" by fixing confirmed scoring gaps, surfacing hidden intelligence signals, unifying the scoring engines, and hardening the AI layer — with no new features, no UI redesign, no infrastructure additions.

## Deliverables

| Day | Files Changed | What Improved |
|---|---|---|
| Day 1 | `JDMatcherPanel.tsx`, `jdMatcher.ts` | Sprint 3's structured section scoring activated (1-line fix); stop word sets unified between engines |
| Day 2 | `ATSScorePanel.tsx` | `keywordDensityScore`, `impactScore`, `completenessScore` now visible to users in a "Resume Intelligence" section |
| Day 3 | `atsEngine.ts` | Impact & Metrics score graduated (20/55/80/100); Skills Coverage score graduated (20/60/80/100); formatting score extracted to shared helper |
| Day 4 | `atsAnalyzer.ts`, `atsBenchmark.test.ts`, `BENCHMARK_REGRESSION.md` | Word-boundary matching for short skill names; Java Full Stack JD benchmark added and verified |
| Day 5 | `promptTemplates.ts`, `ai-insights/route.ts`, `ai-improve/route.ts`, `jd-refine/route.ts` | `max_tokens` and `temperature` added to all AI routes; redundant persona removed from `ai-insights` user prompt |

## Risks
- **Day 3 benchmark impact:** Graduating the binary impact and skills scores may shift some benchmark profiles' Quality scores. If profiles were previously identical (both getting 100 or both getting 20), they may now differentiate. The benchmark assertions were designed for the calibrated tier system — if they fail post-Day 3, recalibration of the expected values (not the scoring logic) may be needed.
- **Day 5 `max_tokens` truncation:** Setting `max_tokens: 400` on `ai-improve` may truncate a very long rewrite for the most verbose sections. If truncation occurs (observable as incomplete sentences in the modal), the constant in `promptTemplates.ts` should be adjusted to 500 — a one-line change.

## Definition of Done
- `npm run build` succeeds with zero TypeScript errors.
- `npx tsx tests/atsBenchmark.test.ts` passes all assertions across all 4 sections.
- All 5 AI features (improve, insights quality, insights match, jd-refine, cover letter) work end-to-end while logged in.
- `JDMatcherPanel` section bars reflect actual resume content (skills %, experience %, projects %).
- `ATSScorePanel` shows a "Resume Intelligence" section with 3 bars.
- Impact & Metrics and Skills Coverage bars in Quality mode show graduated values (not just 20 or 100).
- Skill "Go" does not match resume text containing "going" or "good" in the keyword density calculation.
- All AI routes include `max_tokens` and `temperature` in their OpenRouter calls.
- `docs/01_Master_Roadmap.md` marks Sprint 4 ✅ Complete.

## Exit Criteria
Sprint 4 is complete and Sprint 5 may be planned once:
1. Every Definition of Done item is independently, manually verified — not just "the AI said it passed."
2. The Day 5 full regression pass has been completed in a single continuous session covering all five days' changes.
3. `docs/01_Master_Roadmap.md` shows Sprint 4 as ✅ Complete with a real "Actual Outcome" note reflecting what was actually verified (not what was planned).
4. `docs/25_Backlog.md` is updated with any deferred items surfaced during Sprint 4, prioritized for Sprint 5 consideration.
