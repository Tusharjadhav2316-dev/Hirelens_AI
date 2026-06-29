# HireLens 2.0 — Backend Framework Guide

> Filename kept as "FastAPI Guide" per design review, with the same caveat as the React Guide: treat the title as unconfirmed until Sprint 1, Day 1 confirms the actual backend framework. Rename in Sprint 2 if needed, logged in `20_Decision_Log.md`.

## Current State
**To be verified during Sprint 1, Day 1 (framework identification) and Day 3 (real route/service architecture, async patterns, data access patterns).** Do not assume FastAPI, async/await patterns, a specific ORM, or any specific routing convention until confirmed with file citations.

## Target State
The redesign report's target backend architecture: routing layer separated from business logic (services), CPU-bound work offloaded from any request-handling thread/event-loop model the framework uses, Pydantic-style (or equivalent) request/response validation throughout, and internal tool endpoints exposed for agent orchestration (Sprint 9+). The specific mechanism for "offloading CPU-bound work" depends entirely on the confirmed framework's concurrency model — an async framework needs executor offloading; a sync/threaded framework needs a different approach (e.g., a task queue). This guide does not commit to one until Sprint 1 confirms which applies.

## Migration Strategy
1. Confirm actual backend framework, async/sync model, and routing structure (Sprint 1, Day 1).
2. Confirm actual route-to-service-to-data-access tracing, real blocking-I/O findings, real CORS/auth/error-handling state (Sprint 1, Day 3).
3. Sprint 2 (Architecture Cleanup) addresses only the specific issues Day 3 actually found and cited — e.g., a real CORS wildcard if one is found, a real blocking-I/O instance if one is found. If Day 3 finds none of the issues the original audit assumed, Sprint 2's scope shrinks accordingly rather than inventing work.
4. Sprint 3 (Backend Refactoring) restructures services per whatever target layout Sprint 1/2 establishes as appropriate for the confirmed framework — not a layout copied from a different framework's conventions.

## Open Questions (resolve before Sprint 3)
- What backend language/framework, and what concurrency model does it use?
- What ORM/database driver is actually in use?
- Does the confirmed framework support the streaming mechanism the Coach UI needs (Sprint 6), or does that sprint's approach need to change based on what's confirmed?
