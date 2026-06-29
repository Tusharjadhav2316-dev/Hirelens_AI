# HireLens 2.0 — API Keys & Setup

> Every external service the project actually depends on, confirmed via Sprint 1 discovery. Add a new entry the first day a service is confirmed in use — not in anticipation of it being added later. This file previously listed Gemini, PostgreSQL, and CrewAI as settled facts; per design review, those become entries only once `PROJECT_DISCOVERY.md` confirms them.

## Status: Pending Sprint 1 Verification
Sprint 1, Day 1 searches the codebase for SDK imports and API-key-shaped environment variables. Whatever is actually found gets a full entry below, using this template:

```
## <Service Name>
- **Purpose:** what it's used for in this project specifically
- **Pricing:** current pricing model
- **Free tier:** yes/no, with current limits (verify at time of writing — limits change)
- **How to get a key:** exact steps
- **Env variable name:** exact name as used in this codebase
- **Rate limits:** current limits relevant to this project's usage
- **Security:** never commit; storage location confirmed for this codebase
- **Alternatives:** if relevant
- **How to test the key in isolation:** a minimal standalone check before wiring it into a service
```

## Confirmed Services
_(empty — populated during Sprint 1, Day 1, and only for services with direct evidence in the codebase)_

## Adding a New API to This Doc
Every entry must include all fields in the template above. No exceptions — half-documented APIs cause the most painful debugging sessions. Do not add a speculative entry for a service the project doesn't use yet just because a future sprint might need one — add it when that sprint actually confirms the need.
