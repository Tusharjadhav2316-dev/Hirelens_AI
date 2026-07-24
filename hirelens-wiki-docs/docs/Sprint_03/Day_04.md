# Sprint 3 — Day 4: Enhance AI Section Improvement Route (`app/api/ai-improve/route.ts`)

## Objective
`app/api/ai-improve/route.ts` is the server-side endpoint that rewrites resume sections using Gemini 2.0 Flash Lite. Reading the actual code reveals two confirmed gaps:

1. **`achievements` and `certifications` are unsupported sections.** `ResumeEditor.tsx` shows all seven sections in its nav tab (personal, experience, education, skills, projects, **achievements**, **certifications**). The `AIImprovementModal` component is designed to work with any of them. But the route has this hardcoded validation: `const validSections = ["summary", "experience", "projects"]` — if any form's "AI Improve" button calls the route with `section: "achievements"` or `section: "certifications"`, it receives a `400 Bad Request`. This means any AI improvement button wired up for those sections silently fails.

2. **Improvement prompts have no job-description context.** The current three prompts (summary, experience, projects) improve content in a vacuum. A candidate who is applying for a "Senior Data Engineer" role gets the same generic rewrite suggestions as one applying for a "Product Designer" role. Passing an optional `jobDescription` field in the request body and referencing it in the prompt makes every rewrite more targeted and useful.

Today's work is entirely within `app/api/ai-improve/route.ts`. No other file is modified.

## Concepts
- **Why optional JD context, not required?** Making it required would break every existing call site (all current buttons that call this route don't send a JD). Making it optional means the route improves when a JD is available and degrades gracefully when it isn't — no UI change required today, and the client can pass it in a future sprint when the builder UI gains a JD field.
- **Achievements vs. certifications as different prompt targets:** Achievements are accomplishment-narrative items (title + description) best improved with impact-focused language. Certifications are factual records (name, issuer, year) where there's very little to "improve" in prose terms — the more useful AI action is to suggest how to contextualize a certification in other sections. Both should be supported, but their prompts serve different purposes.

## Prerequisites
- Days 1–3 complete; build succeeds.
- Read `app/api/ai-improve/route.ts` in full — specifically the `validSections` array and the `userPrompt` construction block for each section type.
- Read `components/resume-builder/forms/AchievementsForm.tsx` and `CertificationsForm.tsx` — to understand what `content` looks like for each (achievements contain title + description text; certifications contain name + issuer + year).
- Read `lib/aiService.ts` — to understand the client-side `improveSection()` call signature, since it's the only call site today.

## Setup
No new packages required. The Firebase Admin SDK, OpenRouter client, and TypeScript environment are all already configured from Sprint 2.

## Resources
- `app/api/ai-improve/route.ts` — only file modified today.
- `components/resume-builder/forms/AchievementsForm.tsx` — reference for what achievement content looks like.
- `components/resume-builder/forms/CertificationsForm.tsx` — reference for what certification content looks like.
- `lib/aiService.ts` — the call site, to understand current type constraints.

## Files to Modify
- `frontend/app/api/ai-improve/route.ts` — only file changed today.

**Note on the call site:** `lib/aiService.ts`'s `improveSection()` function currently types the `section` parameter as `"summary" | "experience" | "projects"`. Once the route supports `achievements` and `certifications`, the TypeScript type in `aiService.ts` should be updated to include them — otherwise TypeScript will prevent callers from passing the new values. This is a one-line type change in `aiService.ts`, not a logic change, and is included in today's scope since it's required for the feature to be callable without a TypeScript error.

## Architecture Impact
No new routes, no new infrastructure. The existing `/api/ai-improve` route becomes more capable. The optional `jobDescription` field in the request body is ignored by all existing callers (they don't send it) — zero regression risk.

## Implementation Plan
1. Read `app/api/ai-improve/route.ts` fully before editing.
2. **Expand `validSections`** from `["summary", "experience", "projects"]` to `["summary", "experience", "projects", "achievements", "certifications"]`.
3. **Add achievements prompt.** In the `if/else if` chain that builds `userPrompt`, add:
   ```
   } else if (section === "achievements") {
     userPrompt = `Rewrite this achievement entry to:\n- Use strong, specific action language\n- Emphasize measurable impact and results\n- Be concise and recruiter-focused\n- Preserve all factual content; do not invent metrics\n\n${content}`;
   }
   ```
4. **Add certifications prompt.** Certifications are factual — the AI should not "rewrite" them (there's nothing to rewrite: name, issuer, year are facts). Instead, the prompt should suggest how the certification is best positioned:
   ```
   } else if (section === "certifications") {
     userPrompt = `Review this certification entry and suggest a one-sentence professional description that explains its relevance and value to a recruiter. Do not change the certification name, issuer, or year. Only add context about what this certification demonstrates professionally.\n\n${content}`;
   }
   ```
5. **Add optional `jobDescription` context.** Extract `jobDescription` from the request body (it's optional — default to `undefined` if not present). Where `jobDescription` is present and non-empty, append to the `userPrompt` a context line for all sections:
   ```
   if (jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 0) {
     userPrompt += `\n\nTarget Job Context (tailor the rewrite for this role):\n${jobDescription.substring(0, 1000)}`;
   }
   ```
   The 1000-character truncation prevents context window bloat for a feature that isn't the primary purpose of this route.
6. **Update `lib/aiService.ts`** — change the `section` parameter type from `"summary" | "experience" | "projects"` to `"summary" | "experience" | "projects" | "achievements" | "certifications"`. Also add an optional `jobDescription?: string` field to the function signature, and pass it in the request body when provided. This is the only change to `aiService.ts`.
7. Run `npm run build` and confirm success.
8. Test in the running app: add an achievement, trigger the AI improve action for it, confirm a response is returned and displayed in `AIImprovementModal`.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). Today I am modifying two files:
1. frontend/app/api/ai-improve/route.ts — the AI section improvement API route
2. frontend/lib/aiService.ts — the client-side service that calls this route

I have confirmed by reading the code that:
- validSections is currently: ["summary", "experience", "projects"] — excluding "achievements" and "certifications" which are valid Resume sections used throughout the UI.
- The request body never accepts or uses a jobDescription field for context-aware rewrites.
- lib/aiService.ts types the section parameter as "summary" | "experience" | "projects" which will cause TypeScript errors if callers try to pass "achievements" or "certifications".

Task — Change 1: In frontend/app/api/ai-improve/route.ts:
1. Expand validSections to: ["summary", "experience", "projects", "achievements", "certifications"].
2. Add a userPrompt case for section === "achievements":
"Rewrite this achievement entry to:\n- Lead with a strong, specific action verb\n- Emphasize measurable impact and tangible results\n- Be concise and recruiter-focused (aim for 1-3 sentences)\n- Preserve all factual content; do not invent or fabricate metrics or outcomes\n\n${content}"
3. Add a userPrompt case for section === "certifications":
"Review this certification entry and provide a single professional sentence explaining what this certification demonstrates to a recruiter — its relevance, the skill it validates, and the level of expertise implied. Do not modify the certification name, issuer, or year. Only add professional context.\n\n${content}"
4. After the userPrompt is set (inside the section if/else chain, after all section cases), add optional job description context:
Extract jobDescription from the request body (alongside the existing { section, content } destructure). If jobDescription is a non-empty string, append to userPrompt: "\n\nTarget Job Context (tailor this rewrite for the following role):\n" + jobDescription.substring(0, 1000).
5. Add validation: if jobDescription is provided but not a string or is over 5000 characters, return 400 with error "Job description must be a string under 5000 characters." (Only if it's provided — undefined/missing is fine and means no context.)

Task — Change 2: In frontend/lib/aiService.ts:
1. Update the section parameter type from "summary" | "experience" | "projects" to "summary" | "experience" | "projects" | "achievements" | "certifications".
2. Add an optional jobDescription?: string parameter to the improveSection function signature.
3. In the fetch body JSON, add: ...(jobDescription ? { jobDescription } : {}) to include it only when provided.

Constraints:
- Only frontend/app/api/ai-improve/route.ts and frontend/lib/aiService.ts are modified.
- The system prompt in the existing OpenRouter call ("You are a professional resume optimization assistant...") is not changed.
- All existing validation (content not empty, content <= 2000 chars, section must be in validSections) is preserved.
- The existing three section prompts (summary, experience, projects) are not changed.
- The verifyAuth() call and its placement at the top of the handler are not changed.
- Report the exact diff of both files.
```

## Testing
**How to test:**

1. `npm run build` — must succeed with zero TypeScript errors (the type update in `aiService.ts` must satisfy the compiler).
2. `npm run dev`, open the Resume Builder, navigate to the Achievements section.
3. Add an achievement (title + description). If an "AI Improve" button exists for achievements, click it → confirm the `AIImprovementModal` opens and displays an improved version. If no button is wired yet (the form may not have the button hooked up), test the route directly using `curl` or a fetch from the browser console:
   ```js
   const token = await firebase.auth().currentUser.getIdToken();
   fetch("/api/ai-improve", {
     method: "POST",
     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
     body: JSON.stringify({ section: "achievements", content: "Received employee of the month award." })
   }).then(r => r.json()).then(console.log);
   ```
   Confirm you get `{ improvedContent: "..." }` not a 400 error.
4. Repeat for section: "certifications" with content: "AWS Certified Solutions Architect. Amazon Web Services. 2023."
5. **JD context test:** Add `jobDescription: "Senior Data Engineer role requiring Python, SQL, Spark"` to the request body. Confirm the improved content references data engineering concepts more specifically than it would without context.
6. **Negative test:** Send `section: "education"` (still not in validSections) — confirm 400 is returned.

**Expected result:** Achievements and certifications sections return meaningful AI improvements; JD context produces more targeted rewrites; all existing sections continue to work identically.

**Edge cases:**
- Achievement with very short description ("Won award.") — the AI should work with it; the system prompt's "do not invent metrics" guardrail prevents fabrication.
- Certification with only a name and no issuer/year — the route should still work; the AI has less to contextualize but won't crash.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: "Argument of type 'achievements' is not assignable to parameter of type..." | `aiService.ts` type not yet updated | Confirm `aiService.ts` type union includes `"achievements"` and `"certifications"` |
| Route returns 400 "Invalid section specified" for achievements | `validSections` array wasn't updated, or the spelling differs from what the client sends | Check exact string: `"achievements"` (lowercase, plural) |
| JD context appears even when no JD was sent | `jobDescription` defaulting to `""` instead of `undefined` when not in body | Ensure the destructure uses `const { section, content, jobDescription } = body` with no default value — `undefined` is the correct absent-field behavior |

## Checklist
- [ ] `app/api/ai-improve/route.ts` read in full before editing
- [ ] `validSections` expanded to include `achievements` and `certifications`
- [ ] Achievement prompt added — factual, impact-focused
- [ ] Certification prompt added — context-focused, not rewriting facts
- [ ] Optional `jobDescription` extraction and appending implemented
- [ ] `lib/aiService.ts` type updated; optional `jobDescription` parameter added
- [ ] No other file modified
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Achievements and certifications sections manually tested via the route
- [ ] Existing sections (summary, experience, projects) confirmed unaffected

## Commit Message
```
feat(ai-improve): support achievements and certifications sections, add optional job-description context
```

## Documentation Update
- `docs/25_Backlog.md` — mark AI improvement coverage for all sections as Done (Sprint 3, Day 4).
- `docs/02_Architecture.md` — update the API route description for `/api/ai-improve` to reflect the expanded section support.

## End-of-Day Review
The AI section improvement route now covers all five AI-improvable section types exposed in the Resume Editor UI. No section silently returns a 400 anymore. JD-context-aware rewrites are available to any future caller that passes the optional field — enabling a future sprint to wire a "Optimize for this job" button in the builder without any server-side changes.

## Tomorrow Preview
Day 5 — the final Sprint 3 day — creates `lib/promptTemplates.ts`, a centralized prompt template module that extracts all inline prompt strings from the five API routes into one version-controlled, testable file. It also adds a proper system prompt to `api/ai-insights/route.ts` (the only route that currently has none) and aligns the `api/jd-refine/route.ts` prompt with what the other routes already do well.
