# Day 09 — Job Search

## Objective
Implement the Job Search page layout and UI layer matching **PDF Page 1**:
1. Page Header with briefcase icon tile, "Job Search", subtitle, script accent *"Same You. Bigger Opportunities."*, and right action "Track Applications".
2. Search & Filter Bar:
   - Search inputs: Search Jobs, Location, Job Type + solid violet "Search Jobs →".
   - 6 Filter chips (Experience, Salary, Remote/On-site, Company, Date Posted) + "Clear Filters".
3. Main Area:
   - Dual tabs: "Job Listings" (active) and "AI Matched Jobs" (with "New" badge) + "Sort by: Relevance ⌄".
   - Job cards with company logo monogram, title, "Best Match" pill, location/mode, ₹ LPA salary range, skill tags, circular match % progress ring, and bookmark action.
4. Right Rail:
   - Saved Jobs card ("View All →").
   - Application Tracker card (5 status counts: Applied, Under Review, Interview, Offer, Rejected).
   - AI Job Matching promo card ("Find AI Matched Jobs →").

## Boundary & Existing Feature Integration
- **Preserves `JDMatcherPanel`**: Reachable in the "AI Matched Jobs" tab.
- **Data Boundary**: Where live job listings or application records are not yet backed by third-party APIs, render polished UI shells with documented, honest empty states.

## Reference
- **PDF Page**: **1**
- **Route**: `/dashboard/job-matcher`
