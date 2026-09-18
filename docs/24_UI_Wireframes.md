# HireLens 2.0 — UI Wireframes

> Simple ASCII wireframes for important screens, used to discuss UI before implementation. These describe layout intent, not final visual design — actual implementation should match whatever frontend framework/component conventions Sprint 1 confirms (see `21_Tech_Stack.md`), not a specific library's defaults.

## AI Career Coach (Primary Shell)
```
+-----------------------------------------------------------------+
|  [Logo] HireLens                                       Settings |
+------------------+------------------------------------------------+
|                  |                                                |
|  Active Tools    |   Hello! I'm your AI Career Coach.            |
|                  |   How can I help you?                          |
|  - Resume Canvas |                                                |
|  - ATS Analyzer  |   [ Upload Resume ]   [ Upload Job Description ]
|  - Job Matcher   |                                                |
|  - Cover Letter  |   Suggestions:                                 |
|  - Applications  |   - "Analyze my resume for ATS issues"         |
|                  |   - "Find roles matching my profile"           |
+------------------+------------------------------------------------+
| [================ Input Box ===================================] |
+-------------------------------------------------------------------+
```

## Resume Canvas (Split-Pane Builder)
```
+----------------------------+----------------------------+
|  Section Editor            |   Live Preview              |
|  - Contact Info            |                              |
|  - Summary  [AI rewrite]   |   [ rendered resume, updates |
|  - Experience              |     live as schema changes ] |
|    - Bullet 1 [AI rewrite] |                              |
|    - Bullet 2 [AI rewrite] |                              |
|  - Education               |                              |
|  - Skills                  |   [ Export PDF ] [Export DOCX]
+----------------------------+----------------------------+
```

## ATS Analysis
```
+-----------------------------------------------------------+
|  Overall Score: 68%                                         |
|  [=========================------------------]              |
+-----------------------------------------------------------+
|  Semantic Alignment   72%   [breakdown]                     |
|  Keyword Coverage     55%   [missing: "Kubernetes", "CI/CD"]|
|  Structural Integrity 80%   [breakdown]                     |
|  Readability          65%   [weak verbs flagged: 3 bullets] |
+-----------------------------------------------------------+
|  [ Apply Suggested Rewrites ]   [ Re-score ]                 |
+-----------------------------------------------------------+
```

## Interview Screen
```
+-----------------------------------------------------------+
|  Mock Interview — Senior Backend Engineer @ [Company]       |
+-----------------------------------------------------------+
|  Q3: "Tell me about a time you handled a production         |
|       incident under pressure."                              |
|                                                                |
|  [ Your answer... text area ]                                |
|                                                                |
|  [ Submit Answer ]                            Question 3 of 8|
+-----------------------------------------------------------+
|  Feedback (after submit): clarity, structure, specificity    |
+-----------------------------------------------------------+
```

## Job Matching
```
+-----------------------------------------------------------+
|  Filters: [ Location ] [ Remote ] [ Salary ] [ Visa ]        |
+-----------------------------------------------------------+
|  Senior Backend Engineer — Acme Corp        Match: 87%      |
|  Skill gaps: Kubernetes, gRPC                                |
|  [ View Details ]  [ Generate Cover Letter ]  [ Save ]       |
+-----------------------------------------------------------+
|  Platform Engineer — Globex                 Match: 74%      |
|  Skill gaps: Terraform, AWS                                  |
|  [ View Details ]  [ Generate Cover Letter ]  [ Save ]       |
+-----------------------------------------------------------+
```

## How to Use This Document
Add a wireframe here before a sprint that builds a new screen — it becomes the lightweight spec everyone (including future-you) agrees on before code is written. Update it if the implemented UI diverges meaningfully, so it stays a reliable reference rather than going stale.

---

## AI Career Coach Page (`/dashboard/career-coach`)

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [●] HireLens                                                 [User] │
├──────────────┬──────────────────────────────────────────────────────┤
│ Dashboard    │  [💬] AI Career Coach                                │
│ AI Career ●  │  Powered by your resume & HireLens ATS intelligence  │
│ Resume Bld   │  [● Resume context active] [● ATS score: 72/100]     │
│ Analyzer     │  [ℹ️ Context ▼]                                      │
│ Job Match    ├──────────────────────────────────────────────────────┤
│ Cover Ltr    │  [▼ Add a Job Description for role-specific coaching] │
│ History      ├──────────────────────────────────────────────────────┤
│ Settings     │                                                       │
│              │  ┌──────────────────────────────────────────────┐   │
│              │  │                                              │   │
│              │  │          [✨] Your AI Career Coach           │   │
│              │  │                                              │   │
│              │  │   Ask me anything about your resume, ATS    │   │
│              │  │   scores, job applications, or strategy.    │   │
│              │  │                                              │   │
│              │  │  [What does my ATS score mean?]             │   │
│              │  │  [How can I improve my summary?]            │   │
│              │  │  [What skills should I add?]                │   │
│              │  │  [How well do I match a senior role?]       │   │
│              │  │  [Biggest weaknesses in my resume?]         │   │
│              │  │  [Make my experience more impactful?]       │   │
│              │  └──────────────────────────────────────────────┘   │
│              ├──────────────────────────────────────────────────────┤
│              │  ┌───────────────────────────────────────── [➤] ┐   │
│              │  │ Ask your Career Coach... (Shift+Enter newline)│   │
│              │  └───────────────────────────────────────────────┘   │
│              │  The Coach uses your resume & ATS analysis as context│
└──────────────┴──────────────────────────────────────────────────────┘
```

### Active Conversation State
```
┌──────────────────────────────────────────────────────────────────┐
│ [💬] AI Career Coach            [↺ New conversation]             │
│ [● Resume context active] [● ATS score: 72/100] [ℹ️ Context ▼]  │
│ [▼ Job Description Active ✓]                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌─────────────────────────────────────┐ │
│                         │ What does my impact score of 20/100 │ │
│                         │ mean?                    [👤]       │ │
│                         └─────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ [🤖] According to your HireLens ATS analysis, your      │    │
│  │ Impact & Metrics score is 20/100. This score reflects   │    │
│  │ that no quantified achievements were detected in your   │    │
│  │ resume content...                                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│                         ┌─────────────────────────────────────┐ │
│                         │ How can I fix that?      [👤]       │ │
│                         └─────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ [🤖] ● ● ●  (streaming indicator)                      │    │
│  └──────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────── [➤] ┐     │
│  │ Type here...                                           │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Context Inspector Panel (when expanded)
```
┌──────────────────────────────────────────────────────────────┐
│ What the Coach receives in each request:                     │
│ ✅ Resume: loaded                                            │
│ ✅ ATS Analysis: overall score 72/100 included               │
│ ✅ Job Description: active (1,240 chars)                     │
│ 📊 Conversation history: 4 turns (max 8 before oldest trimmed│
│ ATS scores are computed by HireLens's deterministic engine   │
│ — the Coach explains them, not recalculates them.           │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Layout (≤ 640px)
```
┌─────────────────────────────────┐
│ [≡] HireLens         [User] ⚙️  │
├─────────────────────────────────┤
│ [💬] AI Career Coach            │
│ [● Resume active] [ATS: 72/100] │
├─────────────────────────────────┤
│ [Chat message area — scrollable]│
│                                 │
│     ┌─────────────────────────┐ │
│     │ What does my ATS...     │ │
│     └─────────────────────────┘ │
│ ┌───────────────────────────┐   │
│ │ Here's what the score     │   │
│ │ means...                  │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ ┌──────────────────────── [➤] ┐ │
│ │ Ask anything...            │ │
│ └────────────────────────────┘ │
└─────────────────────────────────┘
```

### Design Notes
- Message bubbles: user = right-aligned, blue (`bg-blue-600`); assistant = left-aligned, slate (`bg-slate-50 dark:bg-slate-800`)
- Streaming indicator: three bouncing dots while `isStreaming=true`
- Consistent with existing dashboard design system — no new design tokens introduced
- Dark mode: all elements follow existing `dark:` Tailwind classes

---

## Sprint 8 — Agent Workspace (`/dashboard/agent`)

> This section supersedes the aspirational "AI Career Coach (Primary Shell)" wireframe at the top of this document — that sketch predates Sprint 1's audit and was never built as drawn. The Agent Workspace below is the real Sprint 8 design, grounded in the actual confirmed Sidebar/dashboard-layout structure (`components/Sidebar.tsx`, `app/dashboard/layout.tsx`).

### Desktop Layout (≥ 1024px) — Conversation + Artifact Canvas
```
+------------------------------------------------------------------------------+
| [icon-rail Sidebar, collapsed 16px, hover-expands - unchanged from today]    |
+--+---------------------------------+-------------------------------------+--+
|  |  AI CAREER AGENT                |  Artifact Canvas                    |  |
|  |  "How can I help you today?"    |                                     |  |
|  |                                  |  [ empty state until an artifact ]  |  |
|  |  Quick actions:                  |  [ arrives - see empty state below] |  |
|  |  [Build Resume] [Check ATS]      |                                     |  |
|  |  [Find Jobs] [Cover Letter]      |                                     |  |
|  |  [Prep Interview]                |                                     |  |
|  |                                  |                                     |  |
|  |  --- conversation scrolls ---    |                                     |  |
|  |  You: improve my summary         |                                     |  |
|  |                                  |                                     |  |
|  |  Manager Agent                   |                                     |  |
|  |  v Understanding request         |                                     |  |
|  |  Resume Agent                    |                                     |  |
|  |  v Reading resume                |                                     |  |
|  |  Optimizer Agent                 |                                     |  |
|  |  * Generating improvement...     |                                     |  |
|  |                                  |                                     |  |
+--+---------------------------------+-------------------------------------+--+
|  [==================== Ask HireLens AI... ============] [Send]              |
+------------------------------------------------------------------------------+
```

### Artifact Canvas — Resume Diff State
```
+---------------------------------------------------------+
|  Proposed Change — Summary                                |
+---------------------------------------------------------+
|  CURRENT:                                                  |
|  "Built React applications."                               |
|                                                             |
|  SUGGESTED:                                                |
|  "Engineered React applications serving 10k+ daily users." |
|                                                             |
|  Rationale: adds measurable scope; matches JD keyword       |
|  "React" already present, strengthens impact language.      |
+---------------------------------------------------------+
|                          [ Reject ]        [ Apply Change ] |
+---------------------------------------------------------+
```

### Artifact Canvas — ATS Score Card State (mirrors existing `ATSScorePanel.tsx` data shape)
```
+---------------------------------------------------------+
|  ATS Analysis — Deterministic Engine Result                |
|  Overall Score: 68/100  [====================------------]|
+---------------------------------------------------------+
|  Summary 72  Experience 65  Skills 55  Projects 70  Edu 90 |
|  Keyword Integration 60  Impact 58  Completeness 75         |
+---------------------------------------------------------+
|  Agent explanation: "Your Skills section is the biggest     |
|  drag on your score - missing: Kubernetes, CI/CD..."        |
+---------------------------------------------------------+
```

### Artifact Canvas — Job Result Card State (new capability, Sprint 8)
```
+---------------------------------------------------------+
|  Senior Backend Engineer - Acme Corp                       |
|  Pune, India (Hybrid) - via [ProviderName]                 |
|  Relevant skills: Node.js, PostgreSQL, AWS                  |
|  [ View Job ]   [ Tailor Cover Letter ]   [ Skill Gap ]      |
+---------------------------------------------------------+
|  (repeats per listing; empty state shown if provider is     |
|   not yet configured - see NullJobProvider in 20_Decision_Log.md)|
+---------------------------------------------------------+
```

### Empty / Loading / Error / Streaming States
| State | Canvas behaviour |
|---|---|
| Empty (no artifact yet) | Friendly placeholder: "Ask me to build, analyze, or improve your resume, find jobs, or prep for an interview — results will show up here." |
| Agent activity streaming | Live-updating checklist (`agent_activity` artifact): pending / active (spinner) / done (check) / error (red) per agent step |
| Tool executing | Inline "Running ATS analysis..." label under the active agent step, sourced from `tool_started` events |
| Success | Artifact renders with primary action buttons enabled |
| Retry | On `error` event, canvas shows the error message + a `[ Try Again ]` button that re-sends the last user message |
| Job provider not configured | `job_result_card` renders a single explanatory card, not an empty silent list — "Job search isn't connected yet" |

### Mobile Layout (≤ 640px)
Single-column, tab-switchable: a `[Chat]` / `[Results]` segmented control replaces the side-by-side split, matching the existing mobile Sidebar drawer pattern (`isOpen`/`setIsOpen` in `Sidebar.tsx`) rather than introducing a new responsive paradigm.

### Design Notes
- Built on the existing HireLens design system (Tailwind CSS v4 tokens, `globals.css`) and current light/dark theme (`ThemeProvider.tsx`) — no new visual language introduced (that is Sprint 11's explicit scope).
- The Sprint 8 Sidebar addition: a new top entry "AI Career Agent" above "Dashboard" (see `Sprint_08/Day_07.md`), since the brief specifies the agent becomes the primary post-login experience. "AI Career Coach" (Sprint 6) remains in the Sidebar, unchanged, as a secondary/direct-access entry.

---

## Sprint 9 — Interview Coach Experience (within the existing Agent Workspace)

> Extends the Sprint 8 Agent Workspace's Artifact Canvas — no new route, no new page shell. All states below render inside the existing `/dashboard/agent` split-pane layout.

### Interview Setup (triggered by "Prepare me for an interview" or a Quick Action chip)
```
+---------------------------------------------------------+
|  Set Up Your Mock Interview                                |
+---------------------------------------------------------+
|  Interview Type                                            |
|  ( ) HR   ( ) Behavioral   ( ) Technical   (*) Mixed        |
|                                                             |
|  Difficulty                                                 |
|  ( ) Beginner  (*) Intermediate  ( ) Advanced               |
|                                                             |
|  Number of Questions                                        |
|  ( ) 5   (*) 10   ( ) 15                                    |
|                                                             |
|  Context: Using your current resume [+ pasted job description if present]|
|                                                             |
|                              [ Start Interview ]             |
+---------------------------------------------------------+
```
Feedback-timing mode ("after each answer" vs. "end of interview," from the brief's suggested config) is **not** a separate Sprint 9 setting — feedback is always shown after each answer (matches the brief's own worked example under "Interview Feedback UX" and keeps the MVP simpler); a true "end of interview only" mode is noted as Optional/Future in `25_Backlog.md`.

### Active Question State (`interview_question_card`, `isActive=true`)
```
+---------------------------------------------------------+
|  Technical Interview - Question 3 of 10                    |
|  ================>-------------------- (progress)          |
+---------------------------------------------------------+
|  "Explain the architecture of your HireLens AI project     |
|   and the part you personally implemented."                |
+---------------------------------------------------------+
|  +-------------------------------------------------------+ |
|  | Type your answer...                                    | |
|  |                                                         | |
|  +-------------------------------------------------------+ |
|                                          [ Submit Answer ]  |
+---------------------------------------------------------+
```

### Feedback State (`interview_feedback_card`, appears after Submit)
```
+---------------------------------------------------------+
|  Answer Feedback                                            |
+---------------------------------------------------------+
|  Strengths                                                  |
|  + Clear explanation of the overall system                 |
|  + Good technical vocabulary                                |
|                                                             |
|  Improve                                                    |
|  ! Your personal contribution vs. the team's wasn't clear   |
|  ! No mention of a measurable outcome                       |
|                                                             |
|  Suggested Structure: Context -> Your Role -> Action -> Result |
+---------------------------------------------------------+
|                                      [ Continue Interview ]  |
+---------------------------------------------------------+
```
If the Adaptive Follow-Up rule (see `02_Architecture.md`) fires, "Continue Interview" advances to a follow-up question instead of the next planned one — the UI does not visually distinguish a follow-up from a planned question (both render as the same Active Question State), keeping the interaction model simple.

### Session Complete / Report State (`interview_report_card`)
```
+---------------------------------------------------------+
|  Interview Readiness Summary                                |
+---------------------------------------------------------+
|  Technical:       Strong                                    |
|  Communication:   Moderate                                  |
|  Project Depth:   Needs Improvement                          |
|  Behavioral:      Strong                                    |
+---------------------------------------------------------+
|  Priority Areas                                              |
|  1. Explain your personal contribution more precisely        |
|  2. Practice quantifying project outcomes                    |
|  3. Review system-design fundamentals                        |
+---------------------------------------------------------+
|  These are coaching recommendations, not guaranteed          |
|  measurements.                                               |
+---------------------------------------------------------+
|              [ Practice Again ]      [ Back to Agent ]       |
+---------------------------------------------------------+
```

### Empty / Loading / Error / Cancel States
| State | Canvas behaviour |
|---|---|
| Between setup and first question | `task_progress` artifact ("Preparing your interview questions...") — reuses the existing Sprint 8 artifact type, no new one needed |
| Answer submitted, feedback pending | `tool_started` event drives the existing `AgentActivityTrace` ("Answer Evaluator: reviewing response") — same mechanism as any other tool call |
| Mid-session error (e.g. OpenRouter call fails) | Structured `error` event; session state is preserved client-side, so "Try Again" retries the same question without losing prior answers |
| User navigates away mid-session | Session state is only held in the Agent Workspace's React state (matches the existing conversation-history precedent) — leaving the page ends the session; no "resume later" affordance in Sprint 9 MVP |
| Cancel mid-session | A `[ Cancel Interview ]` control (visible during the Active Question State) discards the client-held session state immediately — no server call needed, since nothing was ever persisted server-side |

### Mobile Layout
The Active Question State and Feedback State render full-width in the existing mobile `[Results]` tab (see the Sprint 8 mobile pattern above); the answer `<textarea>` uses the same auto-resizing behavior already implemented for the Career Coach's input box.

### Design Notes
- No new page route. Everything above renders inside the existing Sprint 8 Artifact Canvas via 2 new artifact renderers (`InterviewFeedbackCard.tsx`, `InterviewReportCard.tsx`) plus an extension to the existing `InterviewQuestionCard.tsx`.
- Uses the existing HireLens design system exclusively — same card/border/spacing tokens as `ATSScoreCard.tsx` and `ResumeDiffCard.tsx`.

---

## Sprint 10 — AI Interview Trainer (Dedicated Feature)

> A dedicated route tree (`/dashboard/interview-trainer`), **not** an Artifact Canvas artifact — see `20_Decision_Log.md` for why a media-owning, stateful, full-viewport experience cannot live inside the stateless artifact renderer model. Uses the existing HireLens design system and theme only; this is **not** the Sprint 11 premium redesign.

### Navigation
New `Sidebar.tsx` entry, placed after "AI Career Agent" (the existing primary entry) so the two AI-first experiences sit together:
```
[*] AI Career Agent        <- existing primary
[*] AI Interview Trainer   <- NEW dedicated feature
    Dashboard
    AI Career Coach
    Resume Builder
    ... (all existing entries unchanged)
```

### Landing Page (`/dashboard/interview-trainer`)
```
+--------------------------------------------------------------+
|  AI Interview Trainer                                         |
|  Practice real interviews. Get coached. Get better.           |
+--------------------------------------------------------------+
|                  [ Start New Interview ]                      |
+--------------------------------------------------------------+
|  Past Sessions                                                 |
|  Business Analyst - Mixed - Intermediate    12 Sep   [View]    |
|  ML Engineer - Technical - Advanced          8 Sep   [View]    |
|  (empty state: "No practice sessions yet. Start your first     |
|   interview and I'll coach you through it.")                   |
+--------------------------------------------------------------+
```

### Setup (`/dashboard/interview-trainer/setup`)
```
+--------------------------------------------------------------+
|  Set Up Your Interview                                        |
+--------------------------------------------------------------+
|  Target Role  *required                                        |
|  [ Business Analyst____________________ ]                      |
|  Any role works - Teacher, Financial Analyst, ML Engineer...   |
|                                                                |
|  Resume:  [x] Use my current resume  (from ResumeContext)      |
|  Job Description:  [ Paste or upload - optional ]              |
|     Without a JD, I'll infer the role's likely focus areas     |
|     and tell you which parts are inferred.                     |
|                                                                |
|  Interview Type:  ( )HR ( )Behavioral ( )Technical (*)Mixed    |
|                   ( )Role-specific                             |
|  Difficulty:      ( )Beginner (*)Intermediate ( )Advanced      |
|  Training Mode:   (*)Coaching  ( )Realistic Mock               |
|     Coaching = feedback after each answer.                     |
|     Realistic Mock = feedback saved for the final report.      |
|                                                                |
|  Microphone  [ Enable ]   Required for voice mode              |
|              You can also type your answers instead.          |
|  Camera      [ Enable ]   Optional - recommended               |
|              Helps you practice on-screen presence.           |
|              Your camera feed never leaves your device.       |
+--------------------------------------------------------------+
|                         [ Continue ]                           |
+--------------------------------------------------------------+
```

### Interview Strategy Preview (`interview_setup_summary` artifact)
```
+--------------------------------------------------------------+
|  Interview Plan - Business Analyst                            |
|  Basis: inferred from role (no job description provided)      |
+--------------------------------------------------------------+
|  Likely focus areas:                                          |
|  - Requirements gathering        - Stakeholder management      |
|  - Analytical/case reasoning     - Data interpretation (SQL)   |
|  - Communication                                               |
|                                                                |
|  Assumptions I'm making:                                       |
|  - Mid-level individual-contributor scope                      |
|  - Business-facing rather than deeply technical                 |
|  Add a job description to make this more precise.              |
+--------------------------------------------------------------+
|              [ Adjust Setup ]   [ Start Interview ]            |
+--------------------------------------------------------------+
```

### Interview Room (`/dashboard/interview-trainer/room`) — Desktop
```
+--------------------------------------------------------------+
| AI Interview Trainer      Business Analyst      Q 3 / 10       |
+--------------------------------------------------------------+
|                                                                |
|                    AI INTERVIEWER                              |
|                 ( ( ( voice state ) ) )                        |
|                  * AI is speaking...                           |
|                                                                |
|   "Tell me about a time you had to gather requirements         |
|    from stakeholders who disagreed with each other."           |
|                                                                |
| +----------------------+   +-------------------------------+   |
| | Your camera          |   | Progress  # # # o o o o o o o |   |
| |   [ live preview ]   |   | Mode: Coaching                |   |
| |   (optional - off    |   | Difficulty: Intermediate      |   |
| |    shows a placeholder)  | Mic: READY   Camera: ACTIVE   |   |
| +----------------------+   +-------------------------------+   |
|                                                                |
|         MIC LISTENING...  00:42     [ * recording ]            |
|                                                                |
|   [ I'm Done ]  [ Type instead ]  [ Pause ]  [ End Interview ] |
+--------------------------------------------------------------+
```
`[ I'm Done ]` is the **primary turn-ending control** (see `20_Decision_Log.md` — VAD is only an assist). After a sustained silence the UI shows a non-blocking "Still there? Press I'm Done when you've finished." prompt rather than auto-cutting the answer.

### Voice / Media State Indicators (client-local state)
| State | Indicator |
|---|---|
| AI THINKING | Interviewer orb pulses slowly, "Preparing your next question" |
| AI SPEAKING | Orb animates with playback; `[ Skip ]` available |
| LISTENING | Red recording dot + live timer + mic level meter |
| PROCESSING ANSWER | "Transcribing and reviewing your answer..." |
| COACHING | Feedback card slides into view |
| PAUSED | Dimmed room, mic released, `[ Resume ]` |
| ERROR | Inline message + recovery action (retry / type instead) |
| MIC OFF / REQUESTING / BLOCKED | Explicit banner with a "Type your answers instead" escape hatch |
| CAMERA OFF / BLOCKED | Placeholder tile; interview continues normally |

### Answer Feedback (`trainer_answer_feedback` artifact)
```
+--------------------------------------------------------------+
|  Feedback on your answer                                      |
+--------------------------------------------------------------+
|  What worked                                                   |
|  + You named a concrete stakeholder conflict                    |
|  + Clear sequence of events                                     |
|                                                                 |
|  What to improve                                                |
|  ! Your own decision-making role wasn't clear                    |
|  ! No outcome or resolution stated                              |
|                                                                 |
|  Try this structure                                             |
|  Situation -> Your responsibility -> Action -> Result -> Learning|
|                                                                 |
|  How you delivered it                                           |
|  - 2 min 14 s, about 165 words/min (good pace)                   |
|  - "um" x 11, "like" x 6 - try a short silent pause instead     |
|  - 3 long pauses mid-sentence                                    |
|  (Camera: your face left the frame twice)                        |
+--------------------------------------------------------------+
|        [ Try This Answer Again ]     [ Next Question ]          |
+--------------------------------------------------------------+
```
Delivery observations are stated as **countable facts**, never as inferred confidence or emotion. The camera line appears only if camera was enabled.

### Final Report (`trainer_interview_report` artifact)
Sections rendered in order: Session overview · Content performance (qualitative labels) · Communication (with observed numbers) · Visual presence (**omitted entirely if camera was off** — no "not measured" filler) · Strengths · Improvement areas · Question-by-question review (collapsible) · Top 3 priorities · Practice plan for your next session · Confidence coaching. Footer carries the mandatory note: coaching recommendations, not measurements, and not a hiring prediction. Actions: `[ Practice Weakest Question ]` `[ New Interview, Same Role ]` `[ Try Advanced Difficulty ]` `[ Back to Trainer ]`.

### Responsive Behaviour
| Breakpoint | Layout |
|---|---|
| Desktop (>=1024px) | As drawn: interviewer centre, camera tile + progress panel side by side |
| Tablet (640–1023px) | Interviewer centre, camera tile and progress stack below it |
| Mobile (<640px) | Single column: question text first, controls fixed to the bottom, camera preview collapsed to a small floating thumbnail (tappable to expand). `[ I'm Done ]` is a full-width primary button — the most important target on the screen |
Mobile keeps voice as the primary input precisely because typing a long interview answer on a phone is the worst case for the text fallback.
