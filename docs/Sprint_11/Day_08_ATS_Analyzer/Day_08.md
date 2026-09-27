# Day 08 — ATS Analyzer

## Objective
Implement the finalized ATS Analyzer workspace matching **PDF Page 11**:
1. Page Header with blue icon tile, "ATS Analyzer", subtitle, script accent *"Same You. Bigger Opportunities."*, and right action "Analyze History".
2. 3-Card Input Row:
   - **Your Resume**: Upload dropzone with attached file pill (`Tushar_Jadhav_Resume.pdf`, `2.4 MB • PDF`, `✓ Ready` badge, ✕ remove).
   - **Job Description**: Textarea with character counter `0 / 5000 characters`, `🗑 Clear` button, and 4 sample JD chips (Frontend Developer, Software Engineer, Data Analyst, Product Manager).
   - **Tips Rail**: "Tips for better results" checklist + "Need a job description?" link.
3. Full-width violet gradient **"✨ Analyze Resume"** action button bar.
4. 4-Column Results Layout:
   - **ATS Score**: Donut `88/100`, "Good Match" pill, 4 category bars (Skills 92%, Experience 85%, Education 80%, Formatting 78%).
   - **Keyword Analysis**: 3 pill-tag clouds (Matched [18] in green, Missing [6] in red, Suggested [12] in amber).
   - **Resume Preview**: Rendered resume document with Desktop / Mobile segmented toggle.
   - **Insights Stack**: Key Insights list, Improvement Suggestions with chevrons, and "Improve with AI" promo card.

## Reference
- **PDF Page**: **11**
- **Route**: `/dashboard/resume-analyzer`

## Backend & Logic Preservation
- Reuses existing `lib/atsAnalyzer.ts` and `lib/atsEngine.ts` scoring and keyword extraction logic.
- Integrates seamlessly with `ResumeContext` and existing file parsing endpoints.
