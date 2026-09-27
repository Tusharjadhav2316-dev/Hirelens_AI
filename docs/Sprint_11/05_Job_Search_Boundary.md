# Sprint 11 — Job Search Scope Boundary

## What Exists Today (verified)
`app/dashboard/job-matcher/page.tsx` is **36 lines**. It renders a page header ("Job Description Matcher", with a Beta badge), an optional "Currently optimizing for: {name} - {title}" chip from `ResumeContext`, and a single `<JDMatcherPanel resume={resume} />` inside a 2-column grid.

`JDMatcherPanel` is a **resume-vs-one-pasted-JD matcher** backed by `lib/jdMatcher.ts` (`analyzeJobMatch`) via `/api/internal/jd-match`. It produces matched/missing skills and an alignment score.

**There is no job search.** Specifically, the repository contains:
- ❌ no job listings data model
- ❌ no external job API integration or provider credential
- ❌ no saved-jobs collection
- ❌ no application-tracker collection or status model
- ❌ no job-ranking or recommendation engine
- ❌ no `/applications` route
- ❌ no company-logo asset pipeline

Prior sprint documentation (`25_Backlog.md`) records the Job Search provider as shipping behind a `JobProviderAdapter` with a `NullJobProvider`, with **no vendor committed** — consistent with this audit.

## What PDF Page 2 Requires
A full job-search product surface: keyword/location/type search, six filter chips, Job Listings vs "AI Matched Jobs" tabs, sort control, 5 richly-populated job cards (logo, salary in ₹ LPA, experience range, skill tags, circular match %, bookmark), a Saved Jobs rail, an Application Tracker rail with five status counts, and an AI Job Matching promo.

## The Boundary — What Day 09 Does and Does Not Do

### Day 09 DOES
- Implement the **approved page layout, chrome, and component styling** exactly: header, search panel, filter chip row, tab row, sort control, job-card component, right-rail card shells, promo card.
- Build `JobCard`, `FilterChip`, `MatchRing`, and the rail card shells as **real, reusable, styled components** driven by typed props — so that when a provider is wired in a future sprint, the UI is already done and needs only data.
- **Preserve the existing `JDMatcherPanel` integration.** It is working functionality and must not be deleted to make the page match a screenshot. Day 09 keeps it reachable — either as the content of the "AI Matched Jobs" tab (its closest conceptual fit: resume-aware matching) or in a clearly-labelled section. The exact placement decision is made on Day 09 and logged; **removing it is not an option.**
- Render **honest empty states** for everything with no data source: Job Listings, Saved Jobs, Application Tracker, AI Matched counts.
- Point "Track Applications" at a disabled/coming-soon affordance (the route does not exist and must not be created).

### Day 09 DOES NOT
- ❌ integrate any external job API (JSearch, Adzuna, LinkedIn, Indeed, or any other)
- ❌ scrape any job board
- ❌ create job/saved-job/application Firestore collections or security rules
- ❌ build a ranking, scoring, or recommendation engine
- ❌ implement functional filters, sorting, or pagination against real data (controls are rendered and wired to local state only)
- ❌ compute or display a real "match %" per listing (the ring renders from props; with no listings there is nothing to compute)
- ❌ build the Application Tracker's data model or status transitions
- ❌ fabricate example job listings to make the page look populated

## Empty-State Specification (Day 09)
| Region | Empty state |
|---|---|
| Job Listings | Centred illustration-free empty card: "Job search isn't connected yet." + one line explaining that live listings arrive in a future release + a secondary action pointing to the preserved JD-matcher capability ("Match your resume against a job description instead →"). |
| AI Matched Jobs tab | Hosts the preserved `JDMatcherPanel` (pending Day 09 placement decision), which **is** functional. |
| Saved Jobs rail | "No saved jobs yet." — bookmark controls on cards remain visually present but inert until listings exist. |
| Application Tracker rail | Renders the five status rows with **0** counts and a one-line note that tracking arrives with the applications feature. **Do not show 12 / 5 / 3 / 1 / 2 from the reference.** |
| AI Job Matching promo | Renders as designed; CTA routes to the JD-matcher capability rather than a non-existent AI-matching engine. |

## Why This Boundary Exists
The instruction is explicit: implement the approved page/UI layer, preserve the existing integration boundary, and do not expand into job-search engine development. A future sprint owns the provider integration. Building the UI now is genuinely useful — it removes all design work from that future sprint — but shipping fabricated listings would violate the data-truthfulness rule and would make the page look finished when it is not.

## Verification (Day 09)
- Page renders at `/dashboard/job-matcher` with no console errors and no network calls to any external job API (check the Network tab — **there should be none**).
- `JDMatcherPanel` still functions end-to-end: paste a JD, get matched/missing skills.
- No Firestore collection was created (check the console/emulator).
- No new dependency was added to `package.json`.
- Every region with no data source shows its documented empty state, not example data.
