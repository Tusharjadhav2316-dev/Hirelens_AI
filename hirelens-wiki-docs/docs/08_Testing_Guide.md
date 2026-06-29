# HireLens 2.0 — Testing Guide

> Full strategy and tooling lands in Sprint 14, but the conventions below apply from the first line of new/changed code in Sprint 2 onward.

## Backend
- **Framework:** Pytest + `httpx.AsyncClient` for endpoint tests.
- **Convention:** One test file per service/route module: `tests/services/test_pdf_service.py`.
- **Minimum bar per PR:** Every new service function gets at least one happy-path and one failure-path test.

## Frontend
- **Framework:** Vitest + React Testing Library (introduced Sprint 4).
- **Convention:** Co-locate as `Component.test.jsx` next to `Component.jsx`.

## What Gets Tested When
Detailed test plans for ATS scoring, CrewAI agent outputs, and streaming endpoints will be added in `Sprint_08`, `Sprint_09`, and `Sprint_06` respectively — full suite consolidation happens in `Sprint_14`.
