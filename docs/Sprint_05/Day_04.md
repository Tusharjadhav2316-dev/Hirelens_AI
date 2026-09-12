# Sprint 5 — Day 4: Upgrade AIImprovementModal — Regenerate, Editable Output & Mode Indicator

## Objective
Upgrade `AIImprovementModal.tsx` from a passive display component into an active optimizer review workflow. Today adds: a **Regenerate** button (re-run the optimization without closing the modal), an **editable improved-text area** (let the user tweak the AI output before accepting), and a **mode indicator badge** (show which optimization strategy was applied).

## Why This Day Exists

**Confirmed from reading `AIImprovementModal.tsx`:**
The current modal accepts: `originalText`, `improvedText`, `isImproving`, `onClose`, `onAccept`. It renders:
- Left pane: original text (read-only)
- Right pane: improved text (read-only rendered div — not editable)
- Footer: "Accept Changes" button + "Cancel" button

Three problems with the current design:

1. **No Regenerate.** If the AI result is directionally right but off in tone or length, the user's only options are Accept (as-is) or Cancel (lose the work and re-click ✨). Regenerate lets them try again without losing context.

2. **Improved text is not editable.** Users frequently want to use the AI suggestion as a starting point and add their own specifics — particularly for experience bullet points where they know the exact scope. A `<div>` rendering the suggestion forces the user to Accept, then manually edit in the form, then potentially re-optimize. A `<textarea>` makes this natural.

3. **No mode indicator.** After Days 1–3, the AI call may be using `"impact"`, `"action-verbs"`, `"jd-align"`, or no specific mode. The user has no way to know which strategy produced this suggestion. A small badge ("Impact Optimization" / "ATS Keywords" / "Concise" / etc.) adds clarity.

## Repository Evidence / Current State

From reading `AIImprovementModal.tsx`:
```typescript
interface AIImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (finalText: string) => void;   // currently: (improvedText) — no param in current code, check actual signature
    originalText: string;
    improvedText: string;
    isImproving: boolean;
}
```
The `onAccept` currently receives no parameter — it calls `onAccept()` with no argument and the calling form uses `improvedText` from its own state. After today, `onAccept(finalText: string)` receives the (potentially edited) text from the modal's internal state.

The right pane renders: `<div className="...prose...">{improvedText}</div>` — a static div, not a textarea.

## Concepts
- **Internal editable state:** The modal gets a new `localImprovedText` state initialized from `improvedText` prop. The user types in `localImprovedText`; `onAccept(localImprovedText)` sends the final value back. When the prop `improvedText` updates (after Regenerate), `localImprovedText` is reset from the new value via `useEffect`.
- **Regenerate mechanism:** The modal receives an `onRegenerate?: () => void` callback. The calling form's `handleImproveSubmit` function is already idempotent — calling it again resets `improvedText` and re-runs the API call. The Regenerate button simply calls `onRegenerate()` and the modal shows the loading state again while the new result arrives.
- **Mode display names:** Map `OptimizerMode` values to human-readable labels in the modal:
  ```
  "ats"           → "ATS Keywords"
  "impact"        → "Impact Focus"
  "concise"       → "Make Concise"
  "action-verbs"  → "Action Verbs"
  "jd-align"      → "JD Tailored"
  undefined       → "Optimized"  (base rewrite, no specific mode)
  ```
- **`onAccept` signature change:** This is the only breaking change today. All five calling forms currently call `onAccept()` with no argument. After today, `onAccept(finalText: string)` is called. The calling forms' `handleAcceptImprovement` functions need to be updated to receive and use `finalText` instead of reading from their own `improvedText` state.

## Prerequisites
- Days 1–3 complete; build succeeds.
- Read `AIImprovementModal.tsx` in full — the entire file is being modified.
- Read all five forms' `handleAcceptImprovement` functions — each needs a one-line update to the `onAccept` callback.

## Setup
No new packages.

## Resources
- `components/resume-builder/AIImprovementModal.tsx` — primary file modified today
- All five form files — `onAccept` callback and `handleAcceptImprovement` updated

## Files to Modify
- `frontend/components/resume-builder/AIImprovementModal.tsx` — full upgrade
- `frontend/components/resume-builder/forms/PersonalInfoForm.tsx` — `onAccept` callback and `handleAcceptImprovement`
- `frontend/components/resume-builder/forms/ExperienceForm.tsx` — same
- `frontend/components/resume-builder/forms/ProjectsForm.tsx` — same
- `frontend/components/resume-builder/forms/AchievementsForm.tsx` — same
- `frontend/components/resume-builder/forms/CertificationsForm.tsx` — same

## Architecture Impact
The `AIImprovementModalProps` interface gains three new optional props (`onRegenerate`, `optimizationMode`, `isJdActive`). The `onAccept` signature changes from `() => void` to `(finalText: string) => void`. All five calling forms are updated.

## Data Flow
```
User clicks ✨ → handleImproveSubmit() → modal opens → AI result arrives → localImprovedText set
User edits localImprovedText → types additional specific detail
User clicks "Accept" → onAccept(localImprovedText) → calling form updates resume field
  OR
User clicks "Regenerate" → onRegenerate() → handleImproveSubmit() runs again → isImproving=true in modal → new result arrives → localImprovedText reset from new improvedText
```

## Safety / Hallucination Constraints
- The editable textarea allows users to ADD information to the AI output — this is safe because the user is adding their own verified facts (e.g., adding a specific metric the AI correctly omitted).
- Users can also REMOVE AI-generated content they feel is inaccurate. The editable design increases truth control, not decreases it.
- The mode badge must not say "score will increase by X" — it describes the optimization strategy, not a promised outcome.

## Implementation Plan

### Step 1 — Update `AIImprovementModal.tsx`

**Updated interface:**
```typescript
interface AIImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (finalText: string) => void;   // changed: now receives the text
    onRegenerate?: () => void;               // new: optional regenerate callback
    originalText: string;
    improvedText: string;
    isImproving: boolean;
    optimizationMode?: string;               // new: mode label to display
    isJdActive?: boolean;                    // new: show JD badge when true
}
```

**Mode display map** (add as a constant outside the component):
```typescript
const MODE_LABELS: Record<string, string> = {
    "ats": "ATS Keywords",
    "impact": "Impact Focus",
    "concise": "Make Concise",
    "action-verbs": "Action Verbs",
    "jd-align": "JD Tailored",
};
```

**New internal state:**
```typescript
const [localImprovedText, setLocalImprovedText] = useState<string>("");
```

**Sync from prop** (`useEffect` — fires when `improvedText` prop changes, i.e., after Regenerate):
```typescript
useEffect(() => {
    if (improvedText) {
        setLocalImprovedText(improvedText);
    }
}, [improvedText]);

// Reset when modal closes
useEffect(() => {
    if (!isOpen) {
        setLocalImprovedText("");
    }
}, [isOpen]);
```

**Right pane — replace the read-only div with a textarea:**
```tsx
{/* Replace: <div className="...prose...">{improvedText}</div> */}
{/* With: */}
<textarea
    value={localImprovedText}
    onChange={(e) => setLocalImprovedText(e.target.value)}
    disabled={isImproving}
    className="w-full h-full min-h-[160px] p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 custom-scrollbar"
    placeholder={isImproving ? "Optimizing..." : ""}
/>
```

**Footer — add Regenerate button and mode/JD badges:**
```tsx
<div className="flex items-center justify-between">
    {/* Left: mode badges */}
    <div className="flex items-center gap-2">
        {optimizationMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {MODE_LABELS[optimizationMode] ?? optimizationMode}
            </span>
        )}
        {isJdActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                JD Context
            </span>
        )}
    </div>
    {/* Right: action buttons */}
    <div className="flex gap-2">
        {onRegenerate && (
            <button
                onClick={onRegenerate}
                disabled={isImproving}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
                {isImproving ? "..." : "↺ Regenerate"}
            </button>
        )}
        <button
            onClick={() => onClose()}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
            Cancel
        </button>
        <button
            onClick={() => onAccept(localImprovedText)}
            disabled={isImproving || !localImprovedText}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-colors"
        >
            Accept Changes
        </button>
    </div>
</div>
```

### Step 2 — Update calling forms

For each of the five forms, make exactly these changes:

1. **`handleAcceptImprovement`** — change it to receive `finalText: string` and use it:
```typescript
// Before:
const handleAcceptImprovement = () => {
    if (improvingId && improvedText) {
        handleChange(improvingId, "description", improvedText);
    }
    setModalOpen(false); setImprovingId(null); setImprovedText("");
};

// After:
const handleAcceptImprovement = (finalText: string) => {
    if (improvingId && finalText) {
        handleChange(improvingId, "description", finalText);
    }
    setModalOpen(false); setImprovingId(null); setImprovedText("");
};
```

2. **`<AIImprovementModal>` JSX** — add new props:
```tsx
<AIImprovementModal
    isOpen={modalOpen}
    onClose={() => { setModalOpen(false); setImprovingId(null); setImprovedText(""); }}
    onAccept={handleAcceptImprovement}
    onRegenerate={() => {                     // NEW
        const item = data.find(i => i.id === improvingId);
        if (item) handleImproveSubmit(item);
    }}
    originalText={data.find(i => i.id === improvingId)?.description || ""}
    improvedText={improvedText}
    isImproving={!!improvingId && modalOpen && !improvedText}
    optimizationMode={"impact"}              // or "action-verbs" or undefined per form
    isJdActive={!!jobDescription}            // NEW
/>
```

For `PersonalInfoForm` (summary), adapt `handleAcceptImprovement` to update the `summary` field instead of using array item IDs.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 5, Day 4: Upgrade AIImprovementModal.

Files being modified today:
- frontend/components/resume-builder/AIImprovementModal.tsx
- frontend/components/resume-builder/forms/PersonalInfoForm.tsx
- frontend/components/resume-builder/forms/ExperienceForm.tsx
- frontend/components/resume-builder/forms/ProjectsForm.tsx
- frontend/components/resume-builder/forms/AchievementsForm.tsx
- frontend/components/resume-builder/forms/CertificationsForm.tsx

Current state (confirmed by reading the actual code):
1. AIImprovementModal.tsx renders the improvedText in a read-only <div> — not a <textarea>.
2. onAccept() is called with no argument — the calling form reads from its own improvedText state.
3. There is no Regenerate button, no mode badge, no JD-active badge, no editable output.
4. The modal has no internal state.

Task — Change 1: Upgrade AIImprovementModal.tsx.

New interface (replace the existing AIImprovementModalProps):
interface AIImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (finalText: string) => void;
    onRegenerate?: () => void;
    originalText: string;
    improvedText: string;
    isImproving: boolean;
    optimizationMode?: string;
    isJdActive?: boolean;
}

Add outside the component (before the export default):
const MODE_LABELS: Record<string, string> = {
    "ats": "ATS Keywords",
    "impact": "Impact Focus",
    "concise": "Make Concise",
    "action-verbs": "Action Verbs",
    "jd-align": "JD Tailored",
};

Add inside the component:
const [localImprovedText, setLocalImprovedText] = useState<string>("");

useEffect(() => {
    if (improvedText) setLocalImprovedText(improvedText);
}, [improvedText]);

useEffect(() => {
    if (!isOpen) setLocalImprovedText("");
}, [isOpen]);

Add useState to the react import if not already there.

Replace the read-only improved text <div> in the right pane with:
<textarea
    value={localImprovedText}
    onChange={(e) => setLocalImprovedText(e.target.value)}
    disabled={isImproving}
    className="w-full h-full min-h-[160px] p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    placeholder={isImproving ? "Optimizing..." : "Edit the suggestion if needed..."}
/>

Replace the modal footer buttons with:
<div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-2">
        {optimizationMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
                {MODE_LABELS[optimizationMode] ?? optimizationMode}
            </span>
        )}
        {isJdActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                JD Context
            </span>
        )}
    </div>
    <div className="flex gap-2">
        {onRegenerate && (
            <button onClick={onRegenerate} disabled={isImproving}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
                {isImproving ? "..." : "↺ Regenerate"}
            </button>
        )}
        <button onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
        </button>
        <button onClick={() => onAccept(localImprovedText)} disabled={isImproving || !localImprovedText}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium transition-colors">
            Accept Changes
        </button>
    </div>
</div>

Task — Change 2: Update each of the five form files.
For each form, make exactly three changes:
1. Change handleAcceptImprovement to accept (finalText: string) as a parameter and use finalText instead of the form's own improvedText state when calling handleChange() (or the equivalent update function for PersonalInfoForm's summary field).
2. Add onRegenerate prop to the AIImprovementModal JSX: onRegenerate={() => { const item = data.find(i => i.id === improvingId); if (item) handleImproveSubmit(item); }} — for PersonalInfoForm which doesn't use an array/id, onRegenerate={() => handleImproveSubmit()}.
3. Add optimizationMode prop: "impact" for AchievementsForm, "action-verbs" for ExperienceForm, undefined for ProjectsForm, CertificationsForm, PersonalInfoForm.
4. Add isJdActive={!!jobDescription} prop.

Note for CertificationsForm: handleAcceptImprovement currently updates item.name with appended text. Change it to: const handleAcceptImprovement = (finalText: string) => { const item = data.find(i => i.id === improvingId); if (item && finalText) handleChange(improvingId, "name", `${item.name} — ${finalText}`); setModalOpen(false); setImprovingId(null); setImprovedText(""); };

Constraints:
- Only AIImprovementModal.tsx and the five form files are modified.
- api/ai-improve/route.ts is NOT changed.
- lib/aiService.ts is NOT changed.
- lib/promptTemplates.ts is NOT changed.
- ResumeEditor.tsx is NOT changed.
- The visual layout (two-pane side-by-side, original on left) is preserved.
- Do NOT add a score prediction badge (e.g., "ATS score will increase by X%") — this would require a recalculation we are not doing.
- Run npm run build and confirm zero TypeScript errors.
- Report exact diff for all six files.
```

## Automated Testing
```bash
cd frontend
npm run build   # TypeScript validates (finalText: string) callback signature
```

## Manual Testing
1. Open Resume Builder, go to Experience tab, click ✨ on an entry.
2. **Editable output:** Modal opens → result arrives → click inside the right pane text → confirm it's editable → add a specific number (e.g., "Reduced latency by 35%") → click Accept → confirm the form field shows the edited version with your addition.
3. **Regenerate:** With modal open and result showing → click "↺ Regenerate" → confirm loading state re-appears → new result arrives → `localImprovedText` resets to the new AI suggestion.
4. **Mode badge:** Experience form uses `"action-verbs"` mode → badge shows "Action Verbs" in the modal footer.
5. **JD badge:** With a JD pasted in the builder panel → click ✨ → modal shows "JD Context" badge in the footer.
6. **Cancel on regenerate loading:** Click Regenerate → immediately click Cancel → modal closes cleanly without error.
7. **Accept with edited text:** Confirm `onAccept(localImprovedText)` passes the edited text (not original `improvedText` prop) — verify in the form field.

## Verification
- Build passes with zero TypeScript errors
- `onAccept(finalText)` correctly receives the edited text in all five forms
- Regenerate works without memory leaks or duplicate requests (AbortController in `aiService.ts` cancels previous in-flight request)
- Mode badges display for ExperienceForm ("Action Verbs") and AchievementsForm ("Impact Focus")
- JD Context badge shows when `jobDescription` is non-empty

## Edge Cases
- User edits `localImprovedText` then clicks Regenerate — `localImprovedText` resets to new AI suggestion. Expected and correct behavior (user discards manual edit by regenerating).
- `isImproving=true` during Regenerate — Accept and Regenerate buttons are disabled while loading. User cannot double-submit.
- `improvedText` prop is `""` when loading → `localImprovedText` stays `""` (no spurious `useEffect` firing because we guard: `if (improvedText) setLocalImprovedText(improvedText)`).

## Debugging Guide
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript: "Expected 1 arguments but got 0" on `onAccept()` | A form's `handleAcceptImprovement` still calls `onAccept()` without arg | Update all five forms' `handleAcceptImprovement` to `(finalText: string)` and use `onAccept(finalText)` |
| Accepted text is the original AI output even after editing | Form is reading `improvedText` state instead of `finalText` param | Confirm `handleAcceptImprovement(finalText)` uses `finalText`, not `improvedText` |
| Regenerate button triggers infinite loop | `onRegenerate` callback calls `handleImproveSubmit` which sets `improvedText = ""` which fires `useEffect` which sets `localImprovedText = ""` — this is correct, not a loop | Confirm `useEffect` guard: `if (improvedText) setLocalImprovedText(improvedText)` |

## Checklist
- [ ] `AIImprovementModal.tsx` read in full before editing
- [ ] All five form `handleAcceptImprovement` functions read before editing
- [ ] `localImprovedText` state and `useEffect` sync added to modal
- [ ] Right pane changed from read-only div to editable textarea
- [ ] Footer: Regenerate button, Cancel, Accept with `localImprovedText` param
- [ ] Mode badge and JD Context badge added to footer
- [ ] `onAccept(finalText: string)` signature updated in interface
- [ ] All five forms: `handleAcceptImprovement(finalText)` updated
- [ ] All five forms: `onRegenerate`, `optimizationMode`, `isJdActive` added to modal JSX
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Editable output, Regenerate, and badges manually tested

## Commit Message
```
feat(optimizer): upgrade AIImprovementModal with regenerate, editable output, and mode/JD badges
```

## Documentation Updates
- `docs/25_Backlog.md` — mark Day 4 items Done
- `docs/05_Prompt_Library.md` — add Sprint 5 Day 4 entry
- `docs/20_Decision_Log.md` — log `onAccept(finalText)` signature change decision

## End-of-Day Review
The optimizer review workflow is now complete. Users can see which strategy produced the suggestion (mode badge), know if JD context was active (JD badge), edit the AI output before accepting (editable textarea), and try again without losing context (Regenerate). The UX is functional and purposeful — not a design sprint.

## Tomorrow Preview
Day 5 — Sprint 5 close-out. Creates `tests/optimizerSafety.test.ts` to verify truth preservation, quantification accuracy, JD missing-skill safety, and boundary conditions. Runs the full regression suite. Updates all documentation. Marks Sprint 5 complete.
