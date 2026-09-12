# Sprint 6 — Day 5: Resume-Aware Grounding

## Day Title
**AI Career Coach — Resume Context Grounding**

## Objective
Connect the Career Coach to the candidate's actual HireLens resume. Using the `useResume()` hook (already available via `ResumeProvider` in `dashboard/layout.tsx`) and the `buildResumeContextBlock()` helper from Day 1, the current resume is summarized into a context block and included in every Career Coach API request. A "Resume Loaded" status indicator is added to the page.

## Why This Day Exists
Without resume context, the Coach gives generic career advice. With it, the Coach becomes a personalized advisor — it can answer "Which of my skills are most relevant for a data engineering role?" or "What specific improvements would help my summary section?" because it actually knows what the candidate has written. This is the feature that makes the Career Coach distinctly HireLens, not a generic chatbot.

The `ResumeProvider` context is available in the career-coach page automatically because `dashboard/layout.tsx` wraps all children with it. No architecture change is needed — only using what already exists.

## Repository Evidence / Current State
- **`contexts/ResumeContext.tsx`** — confirmed: exports `useResume()` hook returning `{ resume, updateResume, setResume }`. `resume` is the full `Resume` object matching `types/resume.ts`.
- **`app/dashboard/layout.tsx`** — confirmed: `<ResumeProvider>` wraps `<main>{children}</main>` meaning `useResume()` is available in `career-coach/page.tsx` without any layout change.
- **`lib/careerCoachService.ts`** (Day 1) — `buildResumeContextBlock(resume: Resume): string` and `hasResumeContent(resume: Resume): boolean` confirmed available.
- **`app/dashboard/career-coach/page.tsx`** (Day 4) — `handleSend` sends `{ messages: trimmedHistory }` with no context yet.

## Concepts
- **Resume context is computed once per send, not cached:** The resume may be edited in the builder and the Career Coach should reflect the latest state. Calling `buildResumeContextBlock(resume)` at send time ensures the context is always current.
- **Empty resume handling:** If `hasResumeContent(resume)` returns false (no name, no experience, no skills), no resume context block is sent. The Coach's system prompt already handles missing context gracefully. A subtle UI indicator tells the user their resume isn't loaded yet, with a link to the Resume Builder.
- **Not passing the full Resume JSON:** `buildResumeContextBlock` produces ≈600-token plaintext, not the full JSON object. The plaintext is more token-efficient and better formatted for the model.

## Prerequisites
- Days 1–4 complete; streaming works; both test suites pass.
- Read `contexts/ResumeContext.tsx` to confirm the hook API.

## Setup
No new packages.

## Files to Inspect
- `frontend/contexts/ResumeContext.tsx`
- `frontend/lib/careerCoachService.ts`
- `frontend/app/dashboard/career-coach/page.tsx`

## Files to Modify
- `frontend/app/dashboard/career-coach/page.tsx` — add `useResume()`, compute context, pass to fetch, add status indicator

## Files to Create
None today.

## Architecture Impact
No new files. The page now reads from two contexts (`useAuth`, `useResume`). The resume context string is computed client-side using a pure function and sent to the server as a field in the existing request body.

## Data Flow
```
Component mounts / resume changes
→ useResume() provides current resume object
→ hasResumeContent(resume) → boolean (used for UI indicator)
→ buildResumeContextBlock(resume) → string (used in handleSend)

On send:
→ resumeContextString = buildResumeContextBlock(resume)
→ fetch body: { messages: trimmedHistory, resumeContext: resumeContextString || undefined }
```

## Implementation Plan

### Step 1 — Add `useResume` and context helpers to the page
```typescript
import { useResume } from "@/contexts/ResumeContext";
import { buildResumeContextBlock, hasResumeContent, trimConversationHistory, ChatMessage } from "@/lib/careerCoachService";

// Inside component:
const { resume } = useResume();
```

### Step 2 — Compute context and pass in `handleSend`
In `handleSend`, before the `fetch` call, add:
```typescript
const resumeContextString = hasResumeContent(resume) ? buildResumeContextBlock(resume) : undefined;
```
Update the request body:
```typescript
body: JSON.stringify({
    messages: trimmedHistory,
    ...(resumeContextString ? { resumeContext: resumeContextString } : {}),
}),
```

### Step 3 — Add Resume Status Indicator to the header
Between the header div and the message area, add a slim status bar:
```tsx
{/* Context Status Bar */}
<div className="flex items-center gap-3 mb-3 text-xs shrink-0">
    {hasResumeContent(resume) ? (
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Resume context active
        </span>
    ) : (
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            No resume loaded —{" "}
            <a href="/dashboard/builder" className="underline hover:no-underline">
                add content in Resume Builder
            </a>{" "}
            for personalized coaching
        </span>
    )}
</div>
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 5: Resume-Aware Grounding.

The only file being modified today is:
  frontend/app/dashboard/career-coach/page.tsx

Current state: The page has a working streaming Career Coach with no resume context passed to the API.

Task — 3 changes only:

Change 1: Add imports at the top:
- Add useResume from "@/contexts/ResumeContext"
- Ensure buildResumeContextBlock, hasResumeContent, trimConversationHistory, ChatMessage are all imported from "@/lib/careerCoachService" (some may already be there from Days 3–4).

Change 2: Inside the component, add after the useAuth line:
  const { resume } = useResume();

Change 3: In handleSend, immediately before the fetch call, add:
  const resumeContextString = hasResumeContent(resume) ? buildResumeContextBlock(resume) : undefined;
Then update the fetch body's JSON.stringify to include:
  ...(resumeContextString ? { resumeContext: resumeContextString } : {})
alongside the existing messages field.

Change 4: Add a slim context status bar between the page header div and the message area div. When hasResumeContent(resume) is true, show a green dot + "Resume context active" text. When false, show an amber dot + "No resume loaded — [link to /dashboard/builder] for personalized coaching."

Constraints:
- Only career-coach/page.tsx is modified.
- The streaming logic, message list, input, and existing imports are NOT changed.
- No new npm packages.
- resumeContext is sent as undefined (i.e., omitted from body) when the resume has no content — do not send an empty string.
- Run npm run build and confirm zero TypeScript errors.
- Run both existing test suites and confirm they pass.
- Report the exact diff.
```

## Testing
```bash
npm run build
npx tsx tests/atsBenchmark.test.ts
npx tsx tests/optimizerSafety.test.ts
npm run dev
```

**Manual QA:**
1. Fill in resume content in the builder (name, 1 experience entry, some skills).
2. Navigate to Career Coach — "Resume context active" indicator should show green.
3. Ask: "What skills do I have on my resume?" — the Coach should correctly name your actual skills.
4. Navigate to an empty resume state — indicator shows amber, link to builder visible.
5. Ask the same question with empty resume — Coach should say it doesn't have resume information rather than fabricating.

## Regression Testing
Both existing test suites pass. `buildResumeContextBlock` is a pure function — no new behavior introduced that could affect ATS or optimizer tests.

## Checklist
- [ ] `useResume()` added to page
- [ ] `buildResumeContextBlock` and `hasResumeContent` imported
- [ ] `resumeContextString` computed before fetch, passed conditionally
- [ ] Context status bar added (green when loaded, amber with builder link when empty)
- [ ] Empty resume sends no `resumeContext` field (not an empty string)
- [ ] `npm run build` succeeds
- [ ] Resume-aware responses confirmed in browser

## Commit Message
```
feat(career-coach): add resume context grounding and status indicator
```

## Documentation Updates
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 5 entry

## End-of-Day Review
The Career Coach now knows the candidate's actual resume. Questions about skills, experience, and career fit produce personalized, accurate answers instead of generic advice.

## Tomorrow Preview
Day 6 adds the two remaining intelligence layers: ATS context (run `analyzeResume()` client-side and include the deterministic results) and an optional JD context panel (matching the Resume Builder's existing JD input pattern).