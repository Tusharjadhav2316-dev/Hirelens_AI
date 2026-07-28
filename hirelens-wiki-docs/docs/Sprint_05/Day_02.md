# Sprint 5 — Day 2: Wire AI Optimize Buttons to AchievementsForm & CertificationsForm

## Objective
Add ✨ AI optimize buttons to `AchievementsForm.tsx` and `CertificationsForm.tsx`. Both forms exist, are fully wired in the Resume Builder, and the API already handles their section types — but neither has an AI button in its UI.

## Why This Day Exists

**Confirmed from reading the source files:**
- `AchievementsForm.tsx` — zero imports of `improveSection` or `AIImprovementModal`. No AI button exists. The form renders a title + description per achievement, both plain inputs.
- `CertificationsForm.tsx` — same: no imports, no AI button. The form renders name + issuer + year per certification.
- `api/ai-improve/route.ts` — `validSections` includes `"achievements"` and `"certifications"` (added Sprint 3 Day 4).
- `lib/aiService.ts` — `improveSection()` accepts all five sections including these two.

The capability exists in the API layer and has existed since Sprint 3. It was never surfaced in the form UI. Today corrects that with a pattern already proven in `ExperienceForm.tsx` and `ProjectsForm.tsx`.

**What the optimizer does for each section:**
- **Achievements:** Rewrites the `description` field of the achievement entry (the `title` field is a factual name and must not be modified). The `"impact"` mode is the default appropriate mode here — achievements should lead with outcome language.
- **Certifications:** Generates a single professional contextualizing sentence from the certification's `name + issuer + year`. This is not a rewrite of editable text — it produces professional context that the user can optionally save into a `notes` or `description` field (which doesn't currently exist on `Certification` type). Today's scope: produce and display the contextualization sentence in the modal; the accept action copies it to the clipboard or replaces the name field with a formatted string. **Do not add a new field to `types/resume.ts` today** — that's a type change that cascades into the Resume type, scoring functions, and export service. Instead, the accept action for certifications pastes the suggestion into the `name` field with a parenthetical: `"AWS Certified Solutions Architect (Validates cloud architecture expertise at professional level)"`. The user can edit the name field after accepting.

## Repository Evidence / Current State
- `AchievementsForm.tsx` — no AI imports. Pattern to follow: `ExperienceForm.tsx` (complete AI improve integration example).
- `CertificationsForm.tsx` — no AI imports. Simpler because only the name/issuer/year combo is sent as content.
- `AIImprovementModal.tsx` — already accepts `originalText`, `improvedText`, `isImproving` — no changes needed today.
- `lib/aiService.ts` — after Day 1's changes, `improveSection()` now accepts `(section, content, token, jobDescription?, mode?)`.

## Concepts
- **What content to send for achievements:** Send `item.description` only (the narrative text). Never send `item.title` as the content to rewrite — the title is a fact ("Employee of the Year 2023") that must be preserved verbatim. If the description is too short (< 10 chars), show an error prompt like the other forms do.
- **What content to send for certifications:** Compose: `"${item.name} | Issued by: ${item.issuer}${item.year ? ' | Year: ' + item.year : ''}"`. This gives the AI the full certification record to contextualize.
- **Certification accept behavior:** Since there's no `notes` or `description` field on `Certification`, and adding one is out of scope, the accept action updates `item.name` to `"${item.name} — ${improvedText}"`. This is a pragmatic approach that preserves the original name while appending the professional context. Document this limitation in the commit message for future Sprint consideration.
- **Default mode for achievements:** `"impact"` — achievement descriptions should emphasize measurable outcomes.
- **Default mode for certifications:** `undefined` (no mode) — the certification section prompt in `SECTION_BASE_PROMPTS` already does exactly what's needed (professional context sentence).

## Prerequisites
- Day 1 complete: `OptimizerMode`, `SECTION_BASE_PROMPTS`, `buildOptimizerPrompt` exist in `promptTemplates.ts`; `api/ai-improve` accepts `mode`; `aiService.ts` accepts `mode`.
- Read `AchievementsForm.tsx` in full and `ExperienceForm.tsx` in full as the reference pattern.
- Read `CertificationsForm.tsx` in full.

## Setup
No new packages. No new environment variables.

## Resources
- `components/resume-builder/forms/ExperienceForm.tsx` — reference implementation to mirror
- `components/resume-builder/forms/AchievementsForm.tsx` — file being modified
- `components/resume-builder/forms/CertificationsForm.tsx` — file being modified

## Files to Modify
- `frontend/components/resume-builder/forms/AchievementsForm.tsx`
- `frontend/components/resume-builder/forms/CertificationsForm.tsx`

No other files modified today.

## Architecture Impact
No changes to API, data model, or context. Both forms become full participants in the AI optimization workflow.

## Data Flow
```
User clicks ✨ on an achievement description
→ AchievementsForm calls improveSection("achievements", item.description, token, undefined, "impact")
→ AIImprovementModal opens with originalText=item.description, isImproving=true
→ response arrives, improvedText set
→ User clicks "Accept Changes"
→ handleAcceptImprovement() calls onChange() to update item.description in Resume state
→ ATSScorePanel re-evaluates via useMemo (ResumeEditor.tsx) — score updates automatically
```

## Safety / Hallucination Constraints
- Achievement: the `item.title` field must never be sent as content to be rewritten. Only `item.description` is sent.
- Certification: the accept action appends the AI suggestion to the name field. The user sees the original name preserved in the Original panel of the modal — they can reject if they don't want the appended context.
- The `"impact"` mode used for achievements includes the explicit instruction from Day 1: "If no metric exists, improve the phrasing to be outcome-oriented WITHOUT fabricating one."

## Implementation Plan

### AchievementsForm.tsx

Add these imports (copying from ExperienceForm.tsx):
```typescript
import { Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { improveSection } from "@/lib/aiService";
import AIImprovementModal from "../AIImprovementModal";
import { useAuth } from "@/contexts/AuthContext";
```

Add state variables inside the component:
```typescript
const { user } = useAuth();
const [improvingId, setImprovingId] = useState<string | null>(null);
const [modalOpen, setModalOpen] = useState(false);
const [improvedText, setImprovedText] = useState("");
const [errorId, setErrorId] = useState<string | null>(null);
const [errorMsg, setErrorMsg] = useState<string | null>(null);
```

Add handler functions:
```typescript
const handleImproveSubmit = async (item: Achievement) => {
    const currentDesc = item.description?.trim();
    if (!currentDesc || currentDesc.length < 10) {
        setErrorId(item.id);
        setErrorMsg("Please write a description before optimizing.");
        return;
    }
    setErrorId(null);
    setImprovingId(item.id);
    setModalOpen(true);
    setImprovedText("");
    try {
        const token = await user?.getIdToken() || "";
        const improved = await improveSection("achievements", currentDesc, token, undefined, "impact");
        setImprovedText(improved);
    } catch (err: any) {
        setModalOpen(false);
        setErrorId(item.id);
        setErrorMsg(err.message || "Failed to optimize achievement.");
    } finally {
        setImprovingId(null);
    }
};

const handleAcceptImprovement = () => {
    if (improvingId && improvedText) {
        handleChange(improvingId, "description", improvedText);
    }
    setModalOpen(false);
    setImprovingId(null);
    setImprovedText("");
};
```

In the JSX, alongside the existing `<Trash2>` delete button, add a `<Sparkles>` button that calls `handleImproveSubmit(item)`. Mirror the exact button pattern and error display from `ExperienceForm.tsx`. Place `<AIImprovementModal>` at the bottom of the returned JSX.

### CertificationsForm.tsx

Same imports, same state pattern. Handler:
```typescript
const handleImproveSubmit = async (item: Certification) => {
    if (!item.name?.trim()) {
        setErrorId(item.id);
        setErrorMsg("Please enter the certification name before optimizing.");
        return;
    }
    const content = `${item.name}${item.issuer ? ' | Issued by: ' + item.issuer : ''}${item.year ? ' | Year: ' + item.year : ''}`;
    setErrorId(null);
    setImprovingId(item.id);
    setModalOpen(true);
    setImprovedText("");
    try {
        const token = await user?.getIdToken() || "";
        const improved = await improveSection("certifications", content, token);
        setImprovedText(improved);
    } catch (err: any) {
        setModalOpen(false);
        setErrorId(item.id);
        setErrorMsg(err.message || "Failed to generate certification context.");
    } finally {
        setImprovingId(null);
    }
};

const handleAcceptImprovement = () => {
    // Append professional context to the name field
    if (improvingId && improvedText) {
        const item = data.find(i => i.id === improvingId);
        if (item) {
            handleChange(improvingId, "name", `${item.name} — ${improvedText}`);
        }
    }
    setModalOpen(false);
    setImprovingId(null);
    setImprovedText("");
};
```

The `originalText` prop passed to `AIImprovementModal` for certifications should show the composed content string (name + issuer + year) rather than just the name, so the user understands what was sent to the AI.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 5, Day 2.

I am modifying exactly two files:
- frontend/components/resume-builder/forms/AchievementsForm.tsx
- frontend/components/resume-builder/forms/CertificationsForm.tsx

Current state (confirmed by reading the actual code):
- Neither file imports improveSection, AIImprovementModal, useAuth, or Sparkles.
- Neither has any AI optimize button.
- The API route /api/ai-improve already supports section="achievements" and section="certifications" (added Sprint 3, verified in route.ts validSections array).
- lib/aiService.ts improveSection() signature (after Day 1): (section, content, token, jobDescription?, mode?)
- The reference implementation pattern is ExperienceForm.tsx — read it before writing anything.

Task — AchievementsForm.tsx:
1. Add these imports: Sparkles and AlertCircle from "lucide-react", useState from "react", improveSection from "@/lib/aiService", AIImprovementModal from "../AIImprovementModal", useAuth from "@/contexts/AuthContext".
2. Add state: improvingId (string|null), modalOpen (boolean), improvedText (string), errorId (string|null), errorMsg (string|null). Use useAuth() to get user.
3. Add handleImproveSubmit(item: Achievement): validates item.description length >= 10 chars, sets loading state, calls improveSection("achievements", item.description, token, undefined, "impact"), sets improvedText on success, handles error.
4. Add handleAcceptImprovement(): calls handleChange(improvingId, "description", improvedText), resets state.
5. In the JSX for each achievement item card: add a Sparkles button (styled like ExperienceForm's ✨ button) that calls handleImproveSubmit(item). Place it alongside the existing Trash2 delete button.
6. Show error messages (errorId + errorMsg) in the same style as ExperienceForm.
7. Add AIImprovementModal at the bottom of the JSX with: isOpen={modalOpen}, onClose={() => setModalOpen(false)}, onAccept={handleAcceptImprovement}, originalText={data.find(i => i.id === improvingId)?.description || ""}, improvedText={improvedText}, isImproving={!!improvingId && modalOpen && !improvedText}.
8. IMPORTANT: The title field of an achievement must NEVER be sent to the AI. Only item.description is sent as content.

Task — CertificationsForm.tsx:
1. Same imports as above.
2. Same state variables.
3. Add handleImproveSubmit(item: Certification): validates item.name is not empty, composes content string as: `${item.name}${item.issuer ? ' | Issued by: ' + item.issuer : ''}${item.year ? ' | Year: ' + item.year : ''}`, calls improveSection("certifications", content, token) with NO mode (undefined — the base certifications prompt is sufficient).
4. Add handleAcceptImprovement(): IMPORTANT — Certification has no description field in types/resume.ts. Accept behavior: find the current item in data, call handleChange(improvingId, "name", `${item.name} — ${improvedText}`). This appends the professional context sentence to the certification name. Document this in a JSX comment near the accept handler.
5. Add Sparkles button per certification card alongside the existing Trash2 button. Show error messages consistently.
6. originalText prop for AIImprovementModal: pass the composed content string (name + issuer + year), not just item.name — so the user sees what was sent to the AI.
7. Add AIImprovementModal at the bottom of JSX.

Constraints:
- Only AchievementsForm.tsx and CertificationsForm.tsx are modified.
- types/resume.ts is NOT changed — no new fields added to Achievement or Certification.
- AIImprovementModal.tsx is NOT changed.
- The Sparkles button must be visually consistent with ExperienceForm.tsx — use the same className pattern.
- Run npm run build and confirm zero TypeScript errors.
- Report the exact diff of both files.
```

## Automated Testing
```bash
cd frontend
npm run build   # must succeed
```

## Manual Testing
1. `npm run dev`, open Resume Builder, go to Achievements tab.
2. Add an achievement with a short description (< 10 chars) → confirm error message appears, modal does not open.
3. Add an achievement with a real description (e.g., "Won regional hackathon for best AI application with team of four.") → click ✨ → modal opens with loading state → result appears → Accept → confirm description field in the form updates.
4. Go to Certifications tab. Add a certification (name: "AWS Certified Developer", issuer: "Amazon", year: "2023") → click ✨ → modal opens showing the composed content in the Original panel → result appears (a professional context sentence) → Accept → confirm the name field now reads "AWS Certified Developer — [context sentence]".
5. Reject a suggestion — confirm the description/name field is unchanged.

## Verification
- Build passes
- Both forms show ✨ button per item card
- Achievement AI improvement uses `"impact"` mode (visible in browser network request)
- Certification compose content: `"AWS Certified Developer | Issued by: Amazon | Year: 2023"`
- Existing forms (ExperienceForm, ProjectsForm, PersonalInfoForm) still work unchanged

## Edge Cases
- Achievement with only a title, no description → error message, modal does not open
- Certification with no issuer or year → composed content = just `item.name` — still valid, still sent
- Cooldown (2-second) from aiService.ts applies across all AI buttons in all forms — if user clicks both an experience button and an achievement button within 2 seconds, second gets "Please wait a moment"

## Debugging Guide
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error on `improveSection` call with 5 args | Day 1's aiService.ts update not applied | Confirm `mode?: OptimizerMode` is the 5th parameter in aiService.ts |
| Achievement AI button appears but certification does not | CSS display issue or conditional rendering on non-empty items | Check the `data.map()` JSX — button should render for every item regardless of fill state |
| Accept on certification corrupts the name | `item.name` is undefined at accept time | Ensure `handleAcceptImprovement` looks up the item from `data` by `improvingId` before composing the updated name |

## Checklist
- [ ] `AchievementsForm.tsx` and `ExperienceForm.tsx` read in full before editing
- [ ] `CertificationsForm.tsx` read in full before editing
- [ ] Achievement form: Sparkles button added per item, uses `"impact"` mode, only sends `item.description`
- [ ] Certification form: Sparkles button added per item, no mode, sends composed name/issuer/year string
- [ ] Accept behavior for certifications documented in code comment
- [ ] `AIImprovementModal` added to both forms with correct props
- [ ] `types/resume.ts` unchanged
- [ ] `npm run build` succeeds with zero errors
- [ ] Both buttons manually tested in the browser

## Commit Message
```
feat(optimizer): add AI optimize buttons to AchievementsForm and CertificationsForm
```

## Documentation Updates
- `docs/25_Backlog.md` — mark Day 2 items Done
- `docs/05_Prompt_Library.md` — add Sprint 5 Day 2 entry

## End-of-Day Review
All five AI-optimizable resume sections now have UI buttons in the Resume Builder. The optimization system is fully wired: three legacy forms (personal/experience/projects) plus two new forms (achievements/certifications). The API has supported all five since Sprint 3 Day 4 — today the UI finally catches up.

## Tomorrow Preview
Day 3 surfaces JD-aware optimization in the Resume Builder. Currently, no form passes a job description to the AI — the JD parameter has existed in `aiService.ts` since Sprint 3 but is never actually used by any calling form. Day 3 adds a collapsible JD input panel to the Resume Builder and routes its value to all five AI-enabled forms.
