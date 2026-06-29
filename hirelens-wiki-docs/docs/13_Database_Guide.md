# HireLens 2.0 — Database Guide

## Current State
**To be verified during Sprint 1, Day 1 (database technology identification) and Day 3 (actual schema, migration history, access patterns).** Do not assume PostgreSQL, MongoDB, SQLite, or any specific engine, ORM, or migration tool until confirmed via connection strings, driver imports, or migration directories found directly in the codebase.

## Target State
The redesign report's target schema (User, UserSettings, Resume, AtsReport, JobApplication, InterviewSession, ChatSession, Message) describes the *data model* the product needs, not a specific database engine. This data model is largely engine-agnostic — it can be implemented relationally or as documents, depending on what Sprint 1 confirms is already in use. Vector search for career memory (Sprint 10) and semantic job matching (Sprint 6/Sprint 11) does require *some* vector-capable store or extension — which one depends entirely on the confirmed base database (e.g., a vector extension if relational, a vector-native document store feature if document-based, or a dedicated vector database as a separate service if neither base option supports it well).

## Migration Strategy
1. Confirm actual database technology, schema, and migration tooling (Sprint 1, Day 1 and Day 3).
2. Diff the confirmed current schema against the target data model — which entities exist, which are missing, which are partially implemented. This diff happens with real findings, not assumed ones.
3. Sprint 2/3 implements only the confirmed gap, using the confirmed database's actual migration tooling (whatever that turns out to be) — not a generic migration approach.
4. Sprint 10 (Career Memory) revisits vector-search requirements once the base database is confirmed, choosing the lowest-friction option consistent with what's already running rather than introducing a new database service by default.

## Open Questions (resolve before Sprint 2)
- What database engine and ORM/driver are actually in use?
- What migration tool, if any, is actually configured, and what does its history show?
- Does the confirmed database have a viable path to vector search (extension, native feature), or will Sprint 10 need to evaluate a separate vector store?
