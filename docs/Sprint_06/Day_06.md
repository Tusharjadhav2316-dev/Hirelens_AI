Sprint 6 — Day 6: ATS Intelligence & JD Context Integration

## Day Title
**AI Career Coach — ATS Intelligence Grounding & Job Description Context**

## Objective
Add two remaining intelligence layers to the Career Coach: (1) deterministic ATS analysis results included as context, so the Coach explains real scores rather than fabricating assessments; (2) an optional JD text panel the user can paste to enable role-specific coaching.

## Why This Day Exists
Without ATS context, a user who asks "Why is my ATS score low?" gets a generic guess. With it, the Coach can say "According to your HireLens ATS analysis, your Impact & Metrics score is 20/100 — this is because no quantified achievements were detected in your content." That's the difference between a career coach and a chatbot.

The JD panel mirrors the exact pattern from the Resume Builder (Sprint 5 Day 3), keeping UX consistent across the platform.

**Critical principle confirmed from Day 1:** The Coach must NEVER recalculate or invent ATS scores. It explains the deterministic engine's output — it does not replace it.

## Repository Evidence / Current State
- **`lib/atsAnalyzer.ts`** — confirmed: exports `analyzeResume(resume, isOverflowing)` returning `ATSAnalysisResult` with `overallScore`, `sectionScores`, `keywordDensityScore`, `impactScore`, `completenessScore`, `warnings`, `suggestions`. This is a pure client-side function — no network call required.
- **`lib/careerCoachService.ts`** (Day 1) — `buildATSContextBlock(ats: ATSContextInput)` confirmed. `ATSContextInput` matches the shape of `ATSAnalysisResult`.
- **`app/dashboard/career-coach/page.tsx`** (Day 5) — sends `resumeContext`; ready to also send `atsContext`.
- **`components/resume-builder/ResumeEditor.tsx`** — reference for the JD panel UX pattern (collapsible, 5000 char limit, character counter, Clear button).

## Prerequisites
- Day 5 complete; resume context grounding works; build clean.
- Read `lib/atsAnalyzer.ts` — confirm the function signature and return type.
- Read `lib/careerCoachService.ts` — confirm `ATSContextInput` interface matches `ATSAnalysisResult`.

## Setup
No new packages.

## Files to Inspect
- `frontend/lib/atsAnalyzer.ts`
- `frontend/lib/careerCoachService.ts`
- `frontend/components/resume-builder/ResumeEditor.tsx` (JD panel reference)

## Files to Modify
- `frontend/app/dashboard/career-coach/page.tsx` — add ATS context computation + JD panel + update fetch body

## Files to Create
None today.

## Architecture Impact
`analyzeResume()` is called client-side on the career-coach page — the same pure function already called in the Resume Builder and Resume Analyzer. No new API calls, no new services.

## Data Flow
```
On page render / resume change:
→ analyzeResume(resume, false) → ATSAnalysisResult
→ buildATSContextBlock(atsResult) → atsContextString

On send:
→ fetch body includes atsContext: atsContextString (when resume has content)
→ fetch body includes jobDescription: jobDescription (when JD panel has content)

JD Panel state:
→ jobDescription (string, max 5000)
→ jdPanelOpen (boolean)
```

## Implementation Plan

### Step 1 — Import and compute ATS context

Add imports:
```typescript
import { analyzeResume } from "@/lib/atsAnalyzer";
import { buildATSContextBlock, ATSContextInput } from "@/lib/careerCoachService";
```

Inside component, add after `const { resume } = useResume()`:
```typescript
const atsResult = hasResumeContent(resume) ? analyzeResume(resume, false) : null;
const atsContextString = atsResult ? buildATSContextBlock(atsResult as unknown as ATSContextInput) : undefined;
```

**Note on types:** `ATSAnalysisResult` from `atsAnalyzer.ts` and `ATSContextInput` from `careerCoachService.ts` have compatible shapes (confirmed from Day 1 design). If TypeScript flags a mismatch, use a type assertion or verify and align the interfaces. Do not change `atsAnalyzer.ts` — only verify compatibility.

### Step 2 — Add JD panel state and UI

After existing state declarations, add:
```typescript
const [jobDescription, setJobDescription] = useState<string>("");
const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);
```

Add the JD panel between the context status bar and the message area:
```tsx
{/* Optional JD Context Panel — mirrors Resume Builder pattern */}
<div className="mb-3 shrink-0 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
    <button
        onClick={() => setJdPanelOpen(!jdPanelOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
        <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            {jobDescription ? "Job Description Active ✓" : "Add a Job Description for role-specific coaching (optional)"}
        </span>
        <span>{jdPanelOpen ? "▲" : "▼"}</span>
    </button>
    {jdPanelOpen && (
        <div className="px-4 pb-4 pt-1 space-y-2 bg-white dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste a job description to get role-specific advice. The Coach will only reference skills already in your resume.
            </p>
            <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.substring(0, 5000))}
                placeholder="Paste job description here..."
                className="w-full h-24 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{jobDescription.length}/5000</span>
                {jobDescription && (
                    <button onClick={() => setJobDescription("")} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                        Clear
                    </button>
                )}
            </div>
        </div>
    )}
</div>
```

### Step 3 — Pass ATS context and JD in fetch body

Update the `handleSend` fetch body:
```typescript
body: JSON.stringify({
    messages: trimmedHistory,
    ...(resumeContextString ? { resumeContext: resumeContextString } : {}),
    ...(atsContextString ? { atsContext: atsContextString } : {}),
    ...(jobDescription.trim().length >= 20 ? { jobDescription: jobDescription.trim() } : {}),
}),
```

### Step 4 — Add ATS status to context bar

Update the context status bar to show ATS status alongside resume status:
```tsx
{atsResult && (
    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        ATS score: {Math.round(atsResult.overallScore)}/100
    </span>
)}
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 6: ATS Intelligence & JD Context Integration.

The only file being modified today is:
  frontend/app/dashboard/career-coach/page.tsx

Current state: Page has streaming conversation + resume context grounding (Days 1–5). atsContext and jobDescription are not yet included.

Task — 4 changes:

Change 1: Add imports:
- analyzeResume from "@/lib/atsAnalyzer"
- buildATSContextBlock and ATSContextInput from "@/lib/careerCoachService"

Change 2: Inside the component (after useResume), add:
  const atsResult = hasResumeContent(resume) ? analyzeResume(resume, false) : null;
  const atsContextString = atsResult ? buildATSContextBlock(atsResult as ATSContextInput) : undefined;
Note: Use "as ATSContextInput" type assertion if TypeScript flags a shape mismatch between ATSAnalysisResult and ATSContextInput — do NOT modify atsAnalyzer.ts.

Change 3: Add JD panel state:
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);

Add the JD panel div between the context status bar and the message area. Pattern mirrors exactly the JD panel in ResumeEditor.tsx from Sprint 5 Day 3. Requirements:
- Toggle button showing "Add a Job Description for role-specific coaching (optional)" or "Job Description Active ✓" when filled.
- Textarea (h-24, max 5000 chars, onChange clamping).
- Character counter and Clear button when filled.
- Panel text: "Paste a job description to get role-specific advice. The Coach will only reference skills already in your resume."

Change 4: Update handleSend fetch body JSON.stringify to include:
  ...(atsContextString ? { atsContext: atsContextString } : {})
  ...(jobDescription.trim().length >= 20 ? { jobDescription: jobDescription.trim() } : {})
alongside the existing messages and resumeContext fields.

Change 5: Update the context status bar to additionally show ATS score when available:
  When atsResult is not null, add a span showing "ATS score: X/100" with a slate dot.

Constraints:
- Only career-coach/page.tsx is modified.
- atsAnalyzer.ts is NOT changed.
- careerCoachService.ts is NOT changed.
- The ATS result is computed from the deterministic engine — the Coach explains it, never reinvents it.
- JD is only included in the body when length >= 20 characters.
- npm run build must succeed.
- Both existing test suites must pass.
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
1. Add resume content. Navigate to Career Coach — context bar shows "ATS score: X/100".
2. Ask "Why is my impact score low?" — Coach should reference the actual score from the ATS analysis, not a fabricated number.
3. Open JD panel, paste a job description. Ask "How well does my profile match this role?" — Coach should reference actual skills from resume against the JD.
4. Ask Coach to claim a skill that's in the JD but not the resume — Coach should not add it.

## Regression Testing
Both test suites pass. `analyzeResume` is a pure client-side function — running it on the career-coach page has no effect on test files.

## Checklist
- [ ] `analyzeResume` and `buildATSContextBlock` imported
- [ ] ATS result computed when resume has content
- [ ] JD panel state and UI added (mirrors Resume Builder pattern)
- [ ] Fetch body updated with `atsContext` and `jobDescription` fields
- [ ] Context status bar updated with ATS score display
- [ ] Coach gives ATS-grounded answers in manual test
- [ ] Coach does not fabricate skills from JD in manual test
- [ ] `npm run build` succeeds; both test suites pass

## Commit Message
```
feat(career-coach): add ATS intelligence grounding and optional JD context panel
```

## Documentation Updates
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 6 entry
- `docs/02_Architecture.md` — note that `analyzeResume()` is now called in the career-coach page

## End-of-Day Review
The Career Coach is now grounded in all three intelligence layers: the candidate's resume, their deterministic ATS analysis, and (optionally) a target job description. It is ready for Day 7's UX hardening.

## Tomorrow Preview
Day 7 hardens the UX: token limit enforcement, responsive behaviour, message character limits, error state polish, and a context inspector panel showing exactly what context was sent in the most recent request.