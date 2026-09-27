# Day 11 — Cover Letters

## Objective
Implement the dedicated Cover Letters creation workspace matching **PDF Page 5**:
1. Page Header with document icon tile, "Cover Letters", subtitle, and script flourish *"Turn your experience into opportunities"*.
2. Top Feature Row: 4 highlight cards (AI Generated, Multiple Templates, Fully Customizable, Job Specific).
3. 2-Column Workspace:
   - **Left Form** (Tabs: "Create New" active, "Templates", "Saved"):
     - **1. Job Details**: "Load from Job Search" link, Job Title, Company Name, Job Description textarea with char counter (`342/2000`).
     - **2. Your Content**: Select Resume dropdown (`Tushar_Jadhav_Resume.pdf`) + "Upload New" button.
     - **3. Additional Information (Optional)**: Guidance textarea (`0/500`).
     - Action: Full-width violet gradient **"✨ Generate Cover Letter >"** button.
   - **Right Panel (Cover Letter Preview)**:
     - Header: Template selector dropdown ("Professional ⌄").
     - Formatted document paper: Candidate header, Date, Employer address, Salutation, 4 formatted paragraphs, Sign-off.
     - Action Footer: "Edit Content", "Regenerate", "Copy", solid violet "Download PDF".

## Reference
- **PDF Page**: **5**
- **Route**: `/dashboard/cover-letter`
