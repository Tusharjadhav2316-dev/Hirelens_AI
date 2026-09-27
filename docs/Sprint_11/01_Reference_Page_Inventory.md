# Sprint 11 — Finalized Reference PDF: Page Inventory (13 Pages)

> Comprehensive, meticulous audit of all **13 pages** of the finalized reference PDF (`pdf.net_3ab6b014-cf0b-4cae-a3eb-77e6336bfa58.pdf`). Every single screen was inspected visually from rendered high-resolution PNGs.

---

## Global Cross-Cutting Patterns (All Authenticated Pages)

Across all authenticated pages (PDF Pages 1–6, 8–11), the following visual framework is strictly consistent:
1. **Left Sidebar**:
   - HireLens logo + wordmark at top left.
   - **10 Nav Items** in exact order:
     1. Home (`/dashboard`)
     2. AI Agent (`/dashboard/agent`)
     3. Resume Builder (`/dashboard/builder`)
     4. ATS Analyzer (`/dashboard/resume-analyzer`)
     5. Job Search (`/dashboard/job-matcher`)
     6. Cover Letters (`/dashboard/cover-letter`)
     7. Interview Trainer (`/dashboard/interview-trainer`)
     8. Career Coach (`/dashboard/career-coach`)
     9. Resume History (`/dashboard/history`)
     10. Profile Settings (`/dashboard/settings`)
   - Active item has a soft tinted pill background and an active icon.
   - Near bottom: **"Upgrade to Pro"** card (sparkle icon, "Get unlimited AI features, more templates and advanced insights.", violet gradient "Upgrade Now →" button).
   - Bottom user profile block: Circular avatar, "Tushar Jadhav", "tusharjadhav@example.com".
2. **Top Header Bar**:
   - Global search input: "Search jobs, resumes, cover letters, or get AI help...", right-aligned `⌘ K` / `Ctrl K` keycap chip.
   - Violet "Upgrade" button chip.
   - Bell notification icon.
   - User profile chip: Avatar + "Tushar Jadhav / Student • CSE" + dropdown chevron.
3. **Page Header Component**:
   - Soft-tinted square icon tile (rounded, feature-colored).
   - Large bold H1 page title.
   - Muted one-line subtitle.
   - Signature handwritten script accent placed to the right of the header title (e.g., *"Same You. Bigger Opportunities."*, *"Your career. Our guidance. A brighter tomorrow."*, *"Track your growth. Build a better tomorrow."*, etc.).
4. **Card & Surface Language**:
   - Clean white card backgrounds on light grey-blue page canvas (`#F8FAFC`).
   - Border radius: `14px` (`0.875rem`).
   - Hairline low-contrast border (`#E2E8F0`), soft subtle shadow.
   - Micro-badges, clean typography, and consistent spacing.

---

## Detailed Page-by-Page Audit

### PDF Page 1 — Job Search
- **App Page**: Job Search · **Route**: `/dashboard/job-matcher` · **Day**: 09
- **Header**: Briefcase icon tile, "Job Search", subtitle "Find the right opportunities with AI-powered job matching.", right action outlined "Track Applications" with a clock icon.
- **Script Accent**: *"Same You. Bigger Opportunities."*
- **Search Panel**:
  - Three inputs: **Search Jobs** (magnifier, "Software Engineer"), **Location** (pin, "Pune, Maharashtra"), **Job Type** (select, "Full-time") + full-width/inline solid violet "Search Jobs →".
  - Filter chips row: Experience ⌄, Salary ⌄, Remote / On-site ⌄, Company ⌄, Date Posted ⌄, and right-aligned "↻ Clear Filters".
- **Main Column**:
  - Tabs: **Job Listings** (active) and **AI Matched Jobs** (with violet "New" pill) + "Sort by: Relevance ⌄".
  - **5 Job Cards**:
    1. **Google** (Square 'G' logo, "Software Engineer", green "⊙ Best Match" pill, "Bengaluru, Karnataka (Hybrid)", Full-time, 0-2 years, ₹12 - 20 LPA, Skill chips: Java, Python, Data Structures, System Design, Cloud, "View Job →", 92% Match ring, 2 days ago, Bookmark).
    2. **Microsoft** (Four-color logo, "Software Development Engineer", "Hyderabad, Telangana (On-site)", Full-time, 0-2 years, ₹10 - 18 LPA, C++, Python, Distributed Systems, Azure, Problem Solving, 88% Match ring, 3 days ago, Bookmark).
    3. **Amazon** (Amazon 'a' logo, "SDE I", "Pune, Maharashtra (Hybrid)", Full-time, 0-2 years, ₹11 - 19 LPA, Java, React, System Design, AWS, Databases, 85% Match ring, 5 days ago, Bookmark).
    4. **Amazon** ("Software Development Engineer (Frontend)", "Bengaluru, Karnataka (On-site)", Full-time, 0-2 years, ₹10 - 18 LPA, JavaScript, React, Next.js, TypeScript, HTML/CSS, 82% Match ring, 1 week ago, Bookmark).
    5. **Flipkart** (Flipkart bag logo, "Software Engineer", "Bengaluru, Karnataka (Hybrid)", Full-time, 0-2 years, ₹8 - 14 LPA, Java, Spring Boot, MySQL, Microservices, System Design, 78% Match ring, 1 week ago, Bookmark).
- **Right Rail (3 cards)**:
  - **Saved Jobs**: "View All →", 3 rows with company logo, job title, company name, location, age, bookmark.
  - **Application Tracker**: "View All →", 5 status rows with status icons and counts: Applied (12), Under Review (5), Interview (3), Offer (1), Rejected (2).
  - **AI Job Matching**: Purple tinted card, target icon, "Get personalized job recommendations based on your skills, resume, and career goals.", solid violet "Find AI Matched Jobs →".

---

### PDF Page 2 — Career Coach
- **App Page**: Career Coach · **Route**: `/dashboard/career-coach` · **Day**: 12
- **Header**: Message/chat icon tile, "Career Coach", subtitle "Get personalized career guidance, skill development plans, and expert advice for your career growth."
- **Script Accent**: *"Your career. Our guidance. A brighter tomorrow."* + illustration of student climbing step-blocks to a summit flag.
- **Left Rail — Coaching Topics (8 cards)**:
  - Career Planning (Goals, roadmap, strategy)
  - Skill Development (Learn & grow your skills)
  - Job Search Strategy (Applications, networking)
  - Career Transitions (Switch roles or industries)
  - Salary & Negotiation (Get the best offers)
  - Industry Insights (Trends, opportunities)
  - Personal Branding (LinkedIn, online presence)
  - Workplace Success (Productivity, communication)
- **Center Column — Interactive Career Conversation**:
  - Assistant bubble: "Hi Tushar! 👋 I'm your AI Career Coach. I can help you with career planning, skill development, job search strategies, interview preparation, and anything related to your professional growth. What would you like to work on today?"
  - Suggested prompt chips: "Create a career roadmap", "Improve my LinkedIn profile", "Learn in-demand skills", "Prepare for interviews", "Get salary guidance", "Explore career options".
  - User message: "I want to transition from student to a frontend developer role. Can you create a step by step career plan for me?"
  - Coach reply: "Great goal, Tushar! 🚀 Here's a personalized step-by-step career plan to help you transition from a student to a Frontend Developer. This plan is based on current industry trends, required skills, and your background in CSE."
  - **Embedded Rich Interactive Card — Frontend Developer Career Roadmap**:
    - "View Details" button.
    - 6-step horizontal progress tracker:
      1. Build Core Skills (1-2 months)
      2. Build Projects (2-3 months)
      3. Build Profile (1 month)
      4. Apply & Network (Ongoing)
      5. Interview Prep (1-2 months)
      6. Get Hired (Goal)
  - Composer bar: Attachment icon, "Ask anything about your career...", char counter `0/2000`, purple circular send button.
  - Bottom quick tools: "Attach Resume", "Career Roadmap", "Skill Analysis", "Job Market Insights", "••• More Tools".
- **Right Rail**:
  - **Your Career Progress**: 65% donut ("⊙ On Track: You're making great progress towards your career goals!"), 5-stage progress dots (Learning, Practicing, Applying, Interviewing, Hired).
  - **Quick Actions (2x2 grid)**: Create Career Plan, Skill Gap Analysis, Resume Review, Interview Preparation.
  - **Recommended for You**: 3 article cards with image thumbnails, titles ("Frontend Developer Roadmap 2024", "Top In-Demand Frontend Skills", "How to Build a Strong Portfolio"), read times, and external link icons.

---

### PDF Page 3 — Resume History
- **App Page**: Resume History · **Route**: `/dashboard/history` · **Day**: 13
- **Header**: Clock icon tile, "Resume History", subtitle "View, manage, and track all your resume versions in one place."
- **Script Accent**: *"Track your growth. Build a better tomorrow."* + document graphic.
- **Top Metrics Row (4 stat cards)**:
  1. **Total Resumes**: **8** ("All versions saved", document icon).
  2. **ATS Optimized**: **4** ("With AI improvements", growth chart icon).
  3. **Total Views**: **312** ("Across applications", eye icon).
  4. **Total Downloads**: **28** ("PDF exports", download icon).
- **Filter & Search Bar**:
  - Tabs: **All Resumes** (active), **ATS Optimized**, **Custom Templates**, **Starred**.
  - Search input: "Search resumes...", Sort dropdown ("Sort by: Last Modified ⌄"), Template dropdown ("All Templates ⌄").
- **Main 2-Column Split**:
  - **Left List (5 Resume Version Cards)**:
    1. **Frontend Developer Resume** (Purple "Current" badge, "Updated 2 days ago • Professional Template", tags: Frontend Developer, React, TypeScript, circular 92 ATS score ring, Star icon, ⋮ menu).
    2. **Software Engineer Resume** ("Updated 1 week ago • Modern Template", tags: Software Engineer, Next.js, Node.js, circular 86 ATS score ring, Star icon, ⋮ menu).
    3. **Full Stack Developer Resume** ("Updated 2 weeks ago • Creative Template", tags: Full Stack, React, Node.js, circular 78 ATS score ring, Star icon, ⋮ menu).
    4. **Internship Resume** ("Updated 1 month ago • Minimal Template", tags: Internship, Web Development, circular 74 ATS score ring, Star icon, ⋮ menu).
    5. **Campus Placement Resume** ("Updated 2 months ago • Professional Template", tags: Campus Placement, CSE, fresher, circular 81 ATS score ring, Star icon, ⋮ menu).
  - **Right Panel (Selected Resume Live Preview)**:
    - Header: "Resume Preview — Preview your selected resume version", "Edit" button, "Download PDF" button, ⋮ menu.
    - Full rendered resume document: Headshot avatar, Tushar Jadhav, contact details, Professional Summary, Skills tag cloud, Work Experience (Google Frontend Developer Intern), Projects.

---

### PDF Page 4 — Profile Settings
- **App Page**: Profile Settings · **Route**: `/dashboard/settings` · **Day**: 14
- **Header**: User/settings icon tile, "Profile Settings", subtitle "Manage your personal information, preferences, and account settings."
- **Script Accent**: *"Keep your profile updated for better opportunities."* + profile card graphic.
- **Top Tabs Row**: **Personal Info** (active), **Account & Security**, **Preferences**, **Notifications**, **Subscription**.
- **Main 2-Column Split**:
  - **Left Form Card — Profile Information**:
    - "View Public Profile" link.
    - Avatar section: Circular portrait, camera icon button, "Change Photo", caption "JPG, PNG up to 5MB".
    - Inputs: Full Name ("Tushar Jadhav"), Email Address ("tushar@example.com" with lock icon + "Linked with Google (cannot be changed)"), Phone Number ("+91 98765 43210"), Location ("Pune, Maharashtra, India"), Headline ("Computer Science Engineering Student", counter `36/120`), About Me textarea (`120/500`).
    - Education section: College ("Nutan College of Engineering & Research"), Degree ("B.E. in Computer Science"), Year of Graduation ("2027").
    - Social Links: LinkedIn Profile (icon + URL), GitHub Profile (icon + URL).
    - Bottom Action: Solid violet "Save Changes" button.
  - **Right Rail (3 cards)**:
    - **Profile Completion**: **80%** donut ring, "Great progress! 🎉 Complete your profile to get better job recommendations.", Checklist: ✓ Add profile photo, ✓ Add professional headline, ✓ Add education details, ✓ Add skills (minimum 5), ○ Add work experience, ○ Add LinkedIn profile.
    - **Skills**: Skill tag cloud (React, TypeScript, Next.js, JavaScript, Tailwind CSS, Node.js, Python, MongoDB, Firebase, Git, HTML, CSS, "+ Add Skill" pill).
    - **Resume & Documents**: "Manage your default resume and documents", thumbnail of "Tushar_Jadhav_Resume.pdf", green "Default" badge, "Updated 2 days ago • Professional Template", "Change Default Resume" button.

---

### PDF Page 5 — Cover Letters
- **App Page**: Cover Letters · **Route**: `/dashboard/cover-letter` · **Day**: 11
- **Header**: Document/letter icon tile, "Cover Letters", subtitle "Create tailored, professional cover letters that get you noticed."
- **Script Accent**: *"Turn your experience into opportunities"* + document graphic.
- **Top Feature Row (4 highlight cards)**:
  1. **AI Generated** (sparkle icon, "Create personalized cover letters in seconds.")
  2. **Multiple Templates** (doc icon, "Choose from professional templates.")
  3. **Fully Customizable** (sliders icon, "Edit and refine to match your style.")
  4. **Job Specific** (target icon, "Tailored to the job description and company.")
- **Main 2-Column Split**:
  - **Left Form (Tabs: Create New [active], Templates, Saved)**:
    - **1. Job Details** ("Load from Job Search" link): Job Title ("Frontend Developer"), Company Name ("Google"), Job Description textarea (`342/2000` chars).
    - **2. Your Content**: Select Resume dropdown ("Tushar_Jadhav_Resume.pdf") + "Upload New" button.
    - **3. Additional Information (Optional)**: Textarea ("e.g. I am particularly interested in this role because...", `0/500` chars).
    - Bottom Action: Full-width violet gradient "✨ Generate Cover Letter >" button.
  - **Right Panel (Cover Letter Preview)**:
    - Header: Template selector dropdown ("Professional ⌄").
    - Formatted document paper: Candidate contact header, Date, Recipient address (Hiring Manager, Google, Bengaluru), Salutation, 4 body paragraphs, Sign-off ("Sincerely, Tushar Jadhav").
    - Action bar: "Edit Content", "Regenerate", "Copy", solid violet "Download PDF".

---

### PDF Page 6 — Interview Trainer
- **App Page**: Interview Trainer · **Route**: `/dashboard/interview-trainer` · **Day**: 10
- **Header**: People icon tile, "Interview Trainer", subtitle "Practice, improve, and ace your interviews with AI-powered mock interviews.", right action "View Practice History".
- **Script Accent**: *"Same You. Bigger Opportunities."*
- **Row 1**: 3 mode cards (Mock Interview, Practice by Topic, Get Feedback) + "Why Practice with AI?" checklist card.
- **Choose Interview Type**: 5 selectable cards (Technical [active], HR, Aptitude, Company Specific, Custom).
- **Interview Settings & Focus Areas**: Difficulty Level, Number of Questions, Time per Question selects + removable tag chips (Data Structures, Algorithms, System Design, etc.).
- **Full-width violet gradient "▶ Start Interview →" bar**.
- **Bottom Row**: Recent Practice Sessions (scores: 78%, 82%, 70%) and "Your Progress" analytics (77% overall score donut, 4 category bars).

---

### PDF Page 7 — Landing Page
- **App Page**: Landing · **Route**: `/` · **Day**: 02
- **Public Navigation**: HireLens logo, Product ⌄, Solutions ⌄, Resources ⌄, Pricing, Sign in, "Get Started Free →".
- **Hero Section**: Eyebrow ("AI-POWERED CAREER OPERATING SYSTEM"), H1 ("Turn Your Potential Into **Opportunity.**"), body, "Get Started Free →" + "▶ Watch Demo", avatar cluster + "500K+ students & professionals...".
- **Hero Artwork**: Illustration of young professional with backpack looking at city skyline at sunrise, 4 floating cards ("Better Resume", "Dream Job", "Crack Interviews", "Grow Your Skills"), script accent (*"Same You. Bigger Opportunities."*), testimonial card (Tushar Jadhav, 5 stars, quote).
- **Features Section**: 6-card grid with per-tool colored icon tiles (Resume Builder, ATS Analyzer, Job Search, Cover Letters, Interview Trainer, Career Roadmap).
- **How It Works**: 3-step horizontal tracker (Upload or Build → Analyze & Improve → Apply & Grow).
- **Final CTA & Footer**: Promo banner with script accent (*"A Brighter You"*) and complete multi-column SaaS footer.

---

### PDF Page 8 — Dashboard / Home
- **App Page**: Dashboard · **Route**: `/dashboard` · **Day**: 05
- **Header**: Greeting ("Good morning, Tushar! 👋"), date ("Thu, 18 Sep 2025"), "Stay consistent" nudge card, script accent (*"Same You. Bigger Opportunities."*).
- **Stat Row (4 cards)**: Resume Score (**88**), Applications (**12**), Interviews (**3**), Profile Views (**47**).
- **Your Career Journey**: 4-node horizontal stepper (Resume → Applications → Interviews → Dream Job).
- **Quick Actions**: 5 tool cards with directional arrows (Create Resume, Analyze Resume, Generate Cover Letter, Find Jobs, Interview Practice).
- **Bottom Row (3 columns)**: Recent Resumes table, Recommended for You suggestions, 30-day Activity Overview multi-line chart.
- **Bottom AI Banner**: *"Let AI be your career companion."* + *"A Brighter You"*.

---

### PDF Page 9 — Resume Builder
- **App Page**: Resume Builder · **Route**: `/dashboard/builder` · **Day**: 07
- **Header**: Document icon tile, "Resume Builder", Save, Preview, "Download PDF ⌄".
- **Script Accent**: *"Same You. Bigger Opportunities."*
- **4-Column Layout**:
  1. Sections Navigation Rail (80% complete, section list with checkmarks).
  2. Personal Information form (inputs with leading icons, Pro Tip card).
  3. Resume Live Preview (Desktop/Mobile toggle, formatted template).
  4. Right Rail: AI Suggestions (3 items), Resume Score donut (**88/100**), "Ask AI Agent" card.

---

### PDF Page 10 — AI Career Agent
- **App Page**: AI Career Agent · **Route**: `/dashboard/agent` · **Day**: 06
- **Left Column (Chat)**: Header with "⊙ Multi-Agent System" badge, conversational thread, live collapsible activity checklist (Reading resume, Analyzing ATS score, etc.), PDF attachment pill, composer with Quick Actions, and model selector chip.
- **Right Column (Artifact Canvas)**: Filter chips (All, Resume, ATS, Jobs, Cover Letter, Interview), ATS Analysis Result card (88 donut, metric bars, insights), Resume Preview card, Skill Gap Analysis card, and Suggested Jobs mini-cards.

---

### PDF Page 11 — ATS Analyzer
- **App Page**: ATS Analyzer · **Route**: `/dashboard/resume-analyzer` · **Day**: 08
- **Header**: Blue icon tile, "ATS Analyzer", right action "Analyze History".
- **Script Accent**: *"Same You. Bigger Opportunities."*
- **Top Input Row (3 cards)**:
  1. **Your Resume**: Upload dropzone with attached file pill (red PDF icon, "Tushar_Jadhav_Resume.pdf", "2.4 MB • PDF", green `✓ Ready` badge, ✕).
  2. **Job Description**: Textarea with character counter `0 / 5000 characters`, "🗑 Clear" button, and 4 sample JD chips (Frontend Developer, Software Engineer, Data Analyst, Product Manager).
  3. **Tips Rail**: "Tips for better results" checklist + "Need a job description?" link.
- **Action Bar**: Full-width violet gradient "✨ Analyze Resume" bar.
- **Results Row (4 columns)**:
  1. **ATS Score**: Donut 88/100, "Good Match", 4 horizontal bars (Skills 92%, Experience 85%, Education 80%, Formatting 78%).
  2. **Keyword Analysis**: Pill clouds for **Matched Keywords (18)** in green, **Missing Keywords (6)** in red, and **Suggested Keywords (12)** in amber.
  3. **Resume Preview**: Live document preview with Desktop/Mobile toggle.
  4. **Insights Stack**: Key Insights, Improvement Suggestions, and "Improve with AI" promo card.

---

### PDF Page 12 — Sign In
- **App Page**: Sign In · **Route**: `/login` · **Day**: 03
- **Left Column**: Public nav, headline ("Your Career, **Intelligently** Guided."), 4 feature bullets, floating UI preview collage (91/100 score card, mini resume, match pills, script flourishes: *"Turn Insights Into Opportunities"*, *"A Brighter You"*), and 3-stat strip (500K+, 4.8/5, 95%).
- **Right Column**: Centered logo, "Welcome back", Email & Password inputs, Remember Me, Forgot Password link, Full-width violet gradient "Sign In →" button, Google / GitHub / LinkedIn social auth buttons, and 3-item security trust strip.

---

### PDF Page 13 — Sign Up
- **App Page**: Sign Up · **Route**: `/signup` · **Day**: 04
- **Left Column**: Public nav, headline ("Create Your Future With **HireLens**"), 4 benefit bullets, floating UI preview collage (profile, skills cloud, 91/100 donut, Google job card), 3-step timeline, script accents (*"Your Career Starts Here →"*, *"Same You. Bigger Opportunities."*), and 3-stat strip.
- **Right Column**: Centered logo, "Create your account", Full Name, Email, Password, Terms agreement checkbox, Full-width violet gradient "Create Account →" button, social auth buttons, and 3-item security trust strip.
