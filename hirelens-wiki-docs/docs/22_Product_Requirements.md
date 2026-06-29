# HireLens 2.0 — Product Requirements

> MoSCoW-prioritized product backlog. This defines *what* HireLens 2.0 must become, independent of the technology used to build it (see `21_Tech_Stack.md` for that). Sourced from the redesign report's vision; refined as user/product decisions are made.

## Must Have
- AI Career Coach as the primary conversational interface, capable of triggering real backend actions (resume analysis, job matching, cover letter generation) and showing results inline.
- ATS scoring that goes beyond flat keyword matching — multi-dimensional (semantic, coverage, structure, readability).
- Schema-driven resume builder with live preview and PDF/DOCX export.
- Job matching combining semantic similarity with hard constraint filters.
- Cover letter generation tailored to a specific job description and company context.
- Persistent application tracking (status, notes, history).
- Existing functionality must remain available and working throughout the rebuild (per Project Rule 2).

## Should Have
- Multi-agent orchestration (CrewAI or confirmed equivalent) coordinating ATS review, company research, and cover letter generation as a single workflow.
- Interview preparation mode with tailored question generation and feedback.
- Skill-gap analysis with a generated study roadmap.
- Career memory — persistent context about the candidate across sessions.

## Could Have
- Company culture-fit scoring from public reviews/values.
- Application-pipeline kanban view with chat-driven updates.
- Tone/style customization for generated content (cover letters, etc.).

## Won't Have (for this version)
- Multi-tenant SaaS billing/usage metering — explicitly deferred until core product-market fit is established (the redesign report's "enterprise-grade SaaS" section is aspirational, not in scope for the current build).
- Native mobile app — web-first only.
- Recruiter-facing features (this is a candidate-facing tool only, per the original project framing).

## How to Use This Document
When a feature request or idea comes up, it goes here first, with a MoSCoW label, before it goes into `25_Backlog.md` with sprint/dependency detail. This file answers "should we build this at all"; `25_Backlog.md` answers "when and how."
