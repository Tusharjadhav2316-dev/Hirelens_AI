export interface SampleJobDescription {
  id: string;
  title: string;
  role: string;
  description: string;
}

export const SAMPLE_JOB_DESCRIPTIONS: SampleJobDescription[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    role: "Senior React / Next.js Engineer",
    description: `We are looking for a Senior Frontend Developer to build high-performance, responsive web applications using React, Next.js, TypeScript, and Tailwind CSS.

Responsibilities:
• Architect, develop, and maintain modern web user interfaces with Next.js App Router and TypeScript.
• Collaborate with UI/UX designers and backend engineers to translate Figma designs into pixel-perfect components.
• Optimize application performance, SEO, Core Web Vitals, and accessibility (WCAG 2.1).
• Integrate REST and GraphQL APIs, managing client and server state with React Query and Zustand.
• Write comprehensive unit, integration, and E2E tests using Jest and Playwright.

Requirements:
• 4+ years of professional experience with React, TypeScript, Next.js, and modern CSS/Tailwind.
• Strong understanding of JavaScript fundamentals (ES6+), DOM manipulation, and browser rendering.
• Experience with State Management (Redux Toolkit, Zustand, or Context API).
• Familiarity with Git, CI/CD workflows, Docker, and agile development methodologies.
• Excellent communication skills and a passion for engineering excellence.`
  },
  {
    id: "software-eng",
    title: "Software Engineer",
    role: "Full-Stack Software Engineer",
    description: `Join our team as a Full-Stack Software Engineer building scalable microservices and cloud-native applications.

Responsibilities:
• Design and implement scalable backend APIs using Node.js, Python, or Go with PostgreSQL and Redis.
• Build reusable frontend components using TypeScript and modern JavaScript frameworks.
• Deploy and maintain containerized services on AWS / GCP using Docker and Kubernetes.
• Implement robust authentication (OAuth, JWT), role-based access control, and API security best practices.
• Participate in code reviews, sprint planning, architectural design sessions, and system documentation.

Requirements:
• 3+ years of software engineering experience in full-stack web development.
• Proficiency in Python (FastAPI/Django) or Node.js (TypeScript/Express) and relational databases (PostgreSQL/MySQL).
• Hands-on experience with cloud infrastructure (AWS S3, EC2, Lambda) and CI/CD pipelines (GitHub Actions).
• Solid grasp of data structures, algorithms, system design, and RESTful API principles.`
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    role: "Product & Business Data Analyst",
    description: `We are seeking a Data Analyst to transform complex datasets into actionable business intelligence and product insights.

Responsibilities:
• Develop and maintain interactive dashboards in Tableau, Power BI, or Metabase for executive stakeholders.
• Write complex SQL queries, window functions, and CTEs to extract data from data warehouses (Snowflake, BigQuery).
• Perform exploratory data analysis using Python (Pandas, NumPy) to uncover trends and customer retention drivers.
• Design and analyze A/B tests to measure feature impact and user engagement metrics.
• Partner with product and marketing teams to define and track key performance indicators (KPIs).

Requirements:
• 2+ years of experience in data analytics, business intelligence, or quantitative analysis.
• Advanced SQL skills and proficiency in Python or R for statistical analysis.
• Proven track record creating executive dashboards in Tableau or Power BI.
• Strong problem-solving, critical thinking, and storytelling skills with data.`
  },
  {
    id: "product-manager",
    title: "Product Manager",
    role: "Technical Product Manager",
    description: `We are hiring a Technical Product Manager to lead product discovery, roadmap prioritization, and feature execution for our AI-powered SaaS platform.

Responsibilities:
• Define product vision, strategy, and quarterly roadmaps aligned with company business objectives.
• Conduct user interviews, market research, and competitive analysis to identify customer pain points.
• Author detailed Product Requirement Documents (PRDs), user stories, and acceptance criteria in Jira.
• Work closely with engineering and design teams through agile sprint cycles to deliver high-quality releases.
• Monitor product analytics (Mixpanel, PostHog), adoption funnels, and retention metrics.

Requirements:
• 3+ years of product management experience in B2B SaaS or technology platforms.
• Strong technical fluency with APIs, cloud software, and AI/ML capabilities.
• Demonstrated ability to drive consensus across engineering, sales, marketing, and leadership.
• Data-driven mindset with experience defining North Star metrics and running experiment loops.`
  }
];
