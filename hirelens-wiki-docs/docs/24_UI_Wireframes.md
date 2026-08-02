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
