# Backend Audit Report

This document records the results of the backend audit performed during Sprint 1, Day 3, tracing API routes, business logic handlers, and security boundaries.

---

## 1. Route Inventory
The Next.js API layer is located in `frontend/app/api/` and contains the following POST endpoints:
1.  **`POST /api/parse-pdf`**:
    *   *Description*: Receives a PDF file upload, reads it into a buffer, parses its raw text using the `pdf-parse` npm package, and returns the plain text.
2.  **`POST /api/ai-improve`**:
    *   *Description*: Receives a resume section (`summary`, `experience`, `projects`) and raw content, validates length, sends it to OpenRouter using `google/gemini-2.0-flash-lite-001`, and returns the improved bullet points.
3.  **`POST /api/ai-insights`**:
    *   *Description*: Receives resume text, job description, and local score breakdowns. Calls OpenRouter to generate 3-5 career-centric advice bullet points.
4.  **`POST /api/jd-refine`**:
    *   *Description*: Compares resume text with job description text. Queries Gemini 2.0 to identify keyword gaps and returns unstructured advice paragraphs.
5.  **`POST /api/cover-letter`**:
    *   *Description*: Generates or modifies (Polish, Shorten, Make Impactful) cover letters using candidate resume/custom input and job descriptions.

---

## 2. Service and Business Logic Tracing
All API routes follow a simple request proxy flow:
- Body parameters are extracted and validated for structure/length.
- System and user prompts are constructed dynamically using template literals.
- Fetch request is dispatched to `https://openrouter.ai/api/v1/chat/completions` using `process.env.OPENROUTER_API_KEY`.
- OpenAI-compatible JSON choice output is parsed and returned to the client.

---

## 3. Data Access Patterns
*   **Backend Database Access**: **No database connections exist in the API routes.** The backend serverless layer acts strictly as a stateless proxy.
*   **Client Database Access**: All Firestore queries (saving resume revisions, fetching snapshot histories, loading settings, deleting accounts) are performed directly on the client side via the Firebase Web SDK.

---

## 4. Key Gaps & Vulnerabilities
*   **Complete Lack of API Route Authentication**: None of the backend API routes (`/api/*`) implement session checks, header inspections, or token validation. Any client can hit these routes and incur OpenRouter LLM fees or upload files to `/api/parse-pdf`.
*   **No Validation Middleware**: The application has no global middleware layer (`middleware.ts`) to restrict cross-origin access, validate tokens, or perform rate limiting.
*   **Prompt Injection Vulnerabilities**: Inputs like job descriptions and custom text parameters are concatenated directly into the system prompts without sanitization or structural wrapping.
