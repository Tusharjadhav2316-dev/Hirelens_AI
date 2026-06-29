# Environment Verification Report

This document records the results of the local environment verification audit performed during Sprint 1, Day 2.

---

## 1. Verified Package Manager & Commands
*   **Package Manager**: `npm` (determined by the presence of `frontend/package-lock.json`).
*   **Install Command**: `npm install` inside the `frontend` directory.
*   **Development Server Command**: `npm run dev` inside the `frontend` directory.
*   **Production Build Command**: `npm run build` inside the `frontend` directory.

---

## 2. Database Environment Setup
*   **Ecosystem**: Google Firebase (Firestore NoSQL Database + Auth).
*   **Local Setup Convention**: No local database engine, Docker Compose configs, or setup scripts were found in the codebase.
*   **Database connection**: Directly targets Google Firebase Cloud Firestore via the client-side Web SDK using hardcoded configuration parameters in `lib/firebase.ts`.

---

## 3. Environment Variables Audit
We verified that the codebase references the following environment variables:
*   `OPENROUTER_API_KEY`: Required server-side token for proxying LLM requests to OpenRouter (`app/api/*/route.ts`).
*   The `.env.example` file lists multiple Firebase client variables (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`), but these are **ignored** by the codebase, as configurations are statically hardcoded in `lib/firebase.ts`.

---

## 4. Run & Build Results
*   **Development Server Run**: Bootstrapped successfully using `npm run dev`. The Next.js dev server starts on port `3000`.
*   **Production Build**: **Failed** during compile verification (`npm run build`).
    *   *Error Details*:
        ```text
        app/dashboard/cover-letter/page.tsx:171:55 - error TS2345: Argument of type 'Uint8Array' is not assignable to parameter of type 'BlobPart'.
        ```
    *   *Root Cause*: `pdfDoc.save()` returns `Uint8Array`, which cannot be assigned to `BlobPart` directly in React 19 / TypeScript 5 environment without proper instantiation or mapping.

---

## 5. Gaps Identified & Fixes Required
*   **TypeScript Block**: The `cover-letter` PDF compile type mismatch blocks Vercel / production builds. A minimal type cast or array mapping is needed today to unblock the build.
*   **Key Security Leaks**: Storing Firebase config parameters directly in `firebase.ts` exposes development and production credentials to client-side assets.
