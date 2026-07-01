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

### OpenRouter (Gemini API Proxy)
- **Purpose:** Used for all resume improvements, job matching insights, and cover letter generation backend calls.
- **Pricing:** Variable pay-per-token pricing based on the model (using `google/gemini-2.0-flash-lite-001`).
- **Free tier:** No.
- **How to get a key:** Create an account at https://openrouter.ai, add credits, and generate an API key.
- **Env variable name:** `OPENROUTER_API_KEY`
- **Rate limits:** Dependent on OpenRouter tier / credits.
- **Security:** Stored in local `.env`, never committed to the repository.
- **Alternatives:** Direct connection to Google Gemini API (via Google AI Studio).
- **How to test the key in isolation:**
  ```bash
  curl https://openrouter.ai/api/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_OPENROUTER_API_KEY" \
    -d '{
      "model": "google/gemini-2.0-flash-lite-001",
      "messages": [{"role": "user", "content": "Hello"}]
    }'
  ```

### Firebase Admin SDK
- **Purpose:** Used server-side in API routes to verify client-side Firebase Auth ID tokens.
- **Pricing:** Free.
- **Free tier:** Yes, subject to standard Spark/Blaze plan free tiers.
- **How to get a key:** Navigate to Firebase Console -> Project Settings -> Service Accounts, click "Generate new private key", and extract `project_id`, `client_email`, and `private_key` from the downloaded JSON file.
- **Env variable name:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (ensure private key retains newline structure or is formatted properly).
- **Rate limits:** Standard Firebase Authentication limits.
- **Security:** Stored only in local `.env` file, never committed.
- **Alternatives:** None.
- **How to test the key in isolation:** Run the typescript compiler build checks to verify imports, and check that a request returns `401 Unauthorized` without a valid token.

## Adding a New API to This Doc
Every entry must include all fields in the template above. No exceptions — half-documented APIs cause the most painful debugging sessions. Do not add a speculative entry for a service the project doesn't use yet just because a future sprint might need one — add it when that sprint actually confirms the need.
