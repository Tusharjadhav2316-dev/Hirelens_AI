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
