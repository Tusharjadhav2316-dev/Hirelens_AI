# Sprint 5 — Day 3: JD-Aware Optimization — Expose Job Description Context in the Resume Builder

## Objective
Make the optional `jobDescription` parameter in `aiService.ts` and `/api/ai-improve` actually reachable from the Resume Builder UI. Currently, no form passes a JD — the parameter has existed since Sprint 3 Day 4 but has never been called with a value by any form component. Today adds a JD input to the Resume Builder and routes it to all five AI-enabled forms.

## Why This Day Exists

**Confirmed from reading the source:**
- `lib/aiService.ts`: `improveSection(section, content, token, jobDescription?, mode?)` — `jobDescription` is optional and accepted.
- `api/ai-improve/route.ts`: validates and accepts `jobDescription`, appends it to the prompt via `buildOptimizerPrompt()` (after Day 1).
- `PersonalInfoForm.tsx`, `ExperienceForm.tsx`, `ProjectsForm.tsx`, `AchievementsForm.tsx`, `CertificationsForm.tsx`: **zero of these pass `jobDescription`** to `improveSection()`.
- `ResumeEditor.tsx`: renders all five forms, has access to `resume` state via `useResume()`. No JD state exists anywhere in the editor or its context.

The feature gap: a candidate who is applying for a "Senior Machine Learning Engineer" role gets identical optimization suggestions to one applying for a "Frontend UX Designer" role. JD-aware optimization is the most meaningful improvement the optimizer can make — and the infrastructure exists; only the UI plumbing is missing.

**Architecture decision (made today):** Store the JD in `ResumeEditor.tsx` local state (not in `ResumeContext` — the JD is session context for the optimization workflow, not part of the resume data model itself). Pass it down to the five AI-enabled forms via props. This is the cleanest approach that avoids polluting the resume data model or creating a new context provider.

## Repository Evidence / Current State

From `ResumeEditor.tsx`:
- Already passes `data={resume.experience}` and `onChange={(data) => updateResume({ experience: data })}` to forms — form props are well-established.
- `ExperienceForm` interface: `{ data: Experience[], onChange: (data: Experience[]) => void }` — today adds `jobDescription?: string`.
- `ResumeEditor` currently has no JD state.

## Concepts
- **Why local state in ResumeEditor, not ResumeContext:** The JD is not part of the candidate's resume — it's a targeting input for the current optimization session. If the user refreshes or closes the builder, they would naturally re-enter the JD if needed. Persisting it in Firestore would be over-engineering for this sprint. The JD lives and dies with the `ResumeEditor` component instance.
- **Collapsible JD panel:** The Resume Builder's left panel already has a tab row and scrollable form area. Adding a collapsible JD input between the tab row and the form content area keeps the JD accessible without redesigning the layout. A simple `useState(false)` collapse toggle is sufficient.
- **JD character limit in UI:** The API enforces a 5000-character limit on `jobDescription`. The UI textarea should reflect this with a character counter and disabled input beyond the limit. No validation library needed — a simple `value.substring(0, 5000)` on change is sufficient.
- **JD-Align mode auto-activation:** When a JD is present and the user clicks ✨, the AI call does not automatically switch to `"jd-align"` mode — mode selection is the user's explicit choice (coming in Day 4). Today: the JD is passed as context to whatever mode (or no mode) the call currently uses. The `buildOptimizerPrompt()` function already appends JD context to any mode when `jobDescription` is present.

## Prerequisites
- Days 1–2 complete; build succeeds; all five forms have AI buttons.
- Read `ResumeEditor.tsx` in full — today modifies it.
- Read the interface definitions of all five AI-enabled forms to understand how to add `jobDescription` to their props.

## Setup
No new packages.

## Resources
- `components/resume-builder/ResumeEditor.tsx` — primary file modified today
- All five form files — prop interfaces updated
- `lib/aiService.ts` — no change needed (already accepts jobDescription)

## Files to Modify
- `frontend/components/resume-builder/ResumeEditor.tsx` — add JD state + collapsible JD panel + pass to forms
- `frontend/components/resume-builder/forms/PersonalInfoForm.tsx` — add `jobDescription?: string` prop, pass to `improveSection`
- `frontend/components/resume-builder/forms/ExperienceForm.tsx` — same
- `frontend/components/resume-builder/forms/ProjectsForm.tsx` — same
- `frontend/components/resume-builder/forms/AchievementsForm.tsx` — same
- `frontend/components/resume-builder/forms/CertificationsForm.tsx` — same

## Architecture Impact
`ResumeEditor.tsx` becomes the owner of JD session state. All five forms receive it as an optional prop. The `AIService.improveSection()` calls in each form now pass it through. The optimization calls are now JD-aware without any API or data model changes.

## Data Flow
```
User pastes JD into ResumeEditor's JD panel (new textarea)
→ jobDescription state updates in ResumeEditor
→ passed as prop to whichever form is active
→ user clicks ✨ on a section
→ form calls improveSection("experience", content, token, jobDescription, mode)
→ api/ai-improve builds JD-aware prompt via buildOptimizerPrompt()
→ AI response is JD-context-aware
```

## Safety / Hallucination Constraints
- Passing a JD to `buildOptimizerPrompt()` with no mode (base rewrite) appends: "Target Job Context (for context only — do not add missing skills):" — the "do not add missing skills" warning is enforced inside the prompt template from Day 1.
- The UI must not imply to users that the optimizer "adds skills from the JD" — the JD panel label should say "Tailor optimization to this job description (optional)" not "We'll add these skills to your resume."
- The JD textarea is for targeting only — not stored in resume data.

## Implementation Plan

### Step 1 — Add JD state and panel to `ResumeEditor.tsx`

1. Add state: `const [jobDescription, setJobDescription] = useState<string>("")` and `const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false)`.

2. Between the tab row (`<div className="flex p-4 border-b...">`) and the form content (`<div className="flex-1 overflow-y-auto p-6...">`), insert the collapsible JD panel:

```tsx
{/* JD Optimization Context Panel */}
<div className="border-b border-slate-200 dark:border-slate-800">
    <button
        onClick={() => setJdPanelOpen(!jdPanelOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
        <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            {jobDescription ? "JD Context Active ✓" : "Add Job Description for AI Optimization"}
        </span>
        <span className="text-slate-400">{jdPanelOpen ? "▲" : "▼"}</span>
    </button>
    {jdPanelOpen && (
        <div className="px-4 pb-4 pt-1 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste a job description to tailor AI optimization to this role. The AI will align language and emphasis — it will not add skills you do not have.
            </p>
            <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.substring(0, 5000))}
                placeholder="Paste job description here..."
                className="w-full h-28 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 custom-scrollbar"
            />
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{jobDescription.length}/5000</span>
                {jobDescription && (
                    <button
                        onClick={() => setJobDescription("")}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )}
</div>
```

3. Add `Sparkles` to the existing `lucide-react` import in `ResumeEditor.tsx` (it's already imported in the forms — confirm it's not already in ResumeEditor before adding).

4. Pass `jobDescription` to each AI-enabled form:
```tsx
{activeSection === "personal" && (
    <PersonalInfoForm
        data={resume.personalInfo}
        onChange={(personalInfo) => updateResume({ personalInfo })}
        jobDescription={jobDescription}
    />
)}
{activeSection === "experience" && (
    <ExperienceForm
        data={resume.experience}
        onChange={(data) => updateResume({ experience: data })}
        jobDescription={jobDescription}
    />
)}
// ... same for projects, achievements, certifications
```

### Step 2 — Update form prop interfaces and `improveSection` calls

For each of the five forms, make these two changes:

**Interface update:**
```typescript
interface Props {
    data: Experience[];   // or whatever the type is
    onChange: (data: Experience[]) => void;
    jobDescription?: string;   // ADD THIS
}
```

**Destructure update:**
```typescript
export default function ExperienceForm({ data, onChange, jobDescription }: Props) {
```

**`improveSection` call update** (in each form's `handleImproveSubmit`):
```typescript
const improved = await improveSection("experience", currentDesc, token, jobDescription, "impact"); // or whatever mode
```
For achievements: `improveSection("achievements", currentDesc, token, jobDescription, "impact")`
For certifications: `improveSection("certifications", content, token, jobDescription)` — no mode, JD as context
For projects: `improveSection("projects", currentDesc, token, jobDescription)` — no mode (base prompt is fine)
For summary (personal): `improveSection("summary", currentSummary, token, jobDescription)` — no mode

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 5, Day 3: JD-Aware Optimization.

Files being modified today:
- frontend/components/resume-builder/ResumeEditor.tsx
- frontend/components/resume-builder/forms/PersonalInfoForm.tsx
- frontend/components/resume-builder/forms/ExperienceForm.tsx
- frontend/components/resume-builder/forms/ProjectsForm.tsx
- frontend/components/resume-builder/forms/AchievementsForm.tsx
- frontend/components/resume-builder/forms/CertificationsForm.tsx

Current state (confirmed by reading):
- ResumeEditor.tsx has no jobDescription state and no JD panel.
- All five forms have an improveSection() call but pass no jobDescription argument.
- lib/aiService.ts improveSection() already accepts jobDescription? as 4th parameter.
- api/ai-improve route validates and uses jobDescription when present (via buildOptimizerPrompt).
- The 5000 character limit is enforced server-side — UI should mirror it.

Task — Change 1: frontend/components/resume-builder/ResumeEditor.tsx
1. Add state: const [jobDescription, setJobDescription] = useState<string>(""); const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);
2. Add Sparkles to the existing lucide-react import (if not already present; check before adding).
3. Between the tab row div (className contains "flex p-4 border-b") and the form content div (className contains "flex-1 overflow-y-auto p-6"), insert a collapsible JD panel:
   - A toggle button showing "Add Job Description for AI Optimization" (or "JD Context Active ✓" when jobDescription is non-empty) with a Sparkles icon and expand/collapse arrow.
   - When open: a textarea (h-28, resize-none, max 5000 chars with onChange clamping) with a placeholder "Paste job description here...", a character counter (jobDescription.length/5000), and a Clear button when content exists.
   - Use classes consistent with the existing form panel (bg-white dark:bg-slate-900, slate borders, text-xs sizing). Do not introduce new design patterns.
4. Pass jobDescription as a prop to all five AI-enabled forms in their respective activeSection conditionals: PersonalInfoForm, ExperienceForm, ProjectsForm, AchievementsForm, CertificationsForm. EducationForm and SkillsForm do NOT receive it (no AI buttons on those forms).

Task — Change 2: Update all five form files.
For each form, make exactly these changes and no others:
1. Add jobDescription?: string to the Props interface.
2. Add jobDescription to the function parameter destructure.
3. In the handleImproveSubmit function, pass jobDescription as the 4th argument to improveSection().
   - PersonalInfoForm (summary): improveSection("summary", currentSummary, token, jobDescription)
   - ExperienceForm: improveSection("experience", currentDesc, token, jobDescription)
   - ProjectsForm: improveSection("projects", currentDesc, token, jobDescription)
   - AchievementsForm: improveSection("achievements", currentDesc, token, jobDescription, "impact")
   - CertificationsForm: improveSection("certifications", content, token, jobDescription)
4. No other changes to these files — only the interface, destructure, and the improveSection() call argument.

Constraints:
- types/resume.ts is NOT changed.
- ResumeContext.tsx is NOT changed.
- AIImprovementModal.tsx is NOT changed.
- lib/aiService.ts is NOT changed.
- api/ai-improve/route.ts is NOT changed.
- The JD textarea value is capped at 5000 chars client-side via: onChange={(e) => setJobDescription(e.target.value.substring(0, 5000))}
- The JD panel label must NOT imply that the optimizer adds skills from the JD. Use the exact text: "Paste a job description to tailor AI optimization to this role. The AI will align language and emphasis — it will not add skills you do not have."
- Run npm run build and confirm zero TypeScript errors.
- Report the exact diff of all six files.
```

## Automated Testing
```bash
cd frontend
npm run build   # must succeed
```

## Manual Testing
1. Open Resume Builder. Confirm a new collapsible section appears between the tab row and the form content area.
2. Click the toggle — JD panel opens with textarea.
3. Paste a job description (e.g., 200 words about a senior backend engineer role).
4. Toggle shows "JD Context Active ✓".
5. Navigate to Experience tab. Click ✨ on an existing entry.
6. Open browser network tab — confirm the request to `/api/ai-improve` includes `"jobDescription": "..."` in the body.
7. Accept the result — content should reflect JD terminology where the experience content already supports it (e.g., if JD says "microservices" and experience mentions "distributed systems", the rewrite may use "microservices architecture").
8. Click Clear in JD panel — jobDescription becomes empty, toggle returns to "Add Job Description".
9. Click ✨ again — network request no longer includes `jobDescription`.
10. Character counter: paste more than 5000 chars — confirm input stops at 5000.

## Verification
- Build passes
- JD panel appears in the builder and collapses/expands
- Network requests to `/api/ai-improve` include `jobDescription` when panel has content
- Network requests do not include `jobDescription` when panel is empty
- All five AI form buttons still function with and without JD context
- JD state does not persist between page refreshes (session-only, by design)
- EducationForm and SkillsForm do not receive jobDescription prop

## Edge Cases
- JD entered but then cleared before clicking ✨ — next AI call has no JD (correct)
- JD panel open on mobile viewport — textarea may need scroll; the `h-28 resize-none` constraint should prevent layout break
- JD contains special characters (< > & " ') — these are passed as plain string and escaped by `JSON.stringify` in the fetch body

## Debugging Guide
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: "Property 'jobDescription' does not exist on type Props" | Form interface not updated | Confirm `jobDescription?: string` added to Props interface in that form |
| JD not appearing in network request | Form's `handleImproveSubmit` not passing `jobDescription` argument | Check the `improveSection()` call — confirm 4th arg is `jobDescription` not `undefined` |
| JD panel renders outside the scrollable form area | Panel inserted in wrong location in ResumeEditor JSX | The panel must be inside the same parent div as the tab row and form area, between them |

## Checklist
- [ ] `ResumeEditor.tsx` read in full before editing
- [ ] JD state and jdPanelOpen state added to `ResumeEditor`
- [ ] Collapsible JD panel inserted in correct position in JSX
- [ ] Panel label is accurate (does not claim to add skills)
- [ ] `jobDescription` passed as prop to all five AI-enabled forms
- [ ] All five form interfaces updated with `jobDescription?: string`
- [ ] All five `improveSection()` calls updated to pass `jobDescription`
- [ ] Character counter and Clear button work correctly
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] JD context confirmed in network requests when panel has content

## Commit Message
```
feat(optimizer): add JD context panel to Resume Builder; wire jobDescription to all AI-enabled forms
```

## Documentation Updates
- `docs/25_Backlog.md` — mark Day 3 items Done
- `docs/20_Decision_Log.md` — log JD state ownership decision (ResumeEditor local state, not ResumeContext)
- `docs/05_Prompt_Library.md` — add Sprint 5 Day 3 entry

## End-of-Day Review
JD-aware optimization is now fully functional in the Resume Builder. Users who paste a job description see AI rewrites that align with the target role's terminology and emphasis, without fabricating skills. The JD panel is lightweight, session-only, and doesn't interfere with the resume data model.

## Tomorrow Preview
Day 4 upgrades the `AIImprovementModal` to support two new capabilities: a Regenerate button (re-run the same optimization without closing the modal) and an editable improved-text area (user can tweak the AI output before accepting). Both changes are contained within the modal component and its calling forms.
