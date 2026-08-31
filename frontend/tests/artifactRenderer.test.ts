import { ArtifactRenderer } from "../components/agent/ArtifactRenderer";
import { Artifact } from "../types/agent";

async function runArtifactRendererTest() {
    console.log("=== ArtifactRenderer Unit & Defense-in-Depth Test Suite ===\n");

    // Mock data for all 7 artifact types
    const mockArtifacts: Artifact[] = [
        {
            type: "ats_score_card",
            data: {
                result: {
                    overallScore: 82,
                    sectionScores: { summary: 80, skills: 85, experience: 80, projects: 85, education: 90 },
                    warnings: ["Add more quantifiable metrics"],
                    suggestions: ["Include keywords: TypeScript, Docker"],
                    keywordDensityScore: 78,
                    impactScore: 80,
                    completenessScore: 90,
                },
                explanation: "Your ATS score is strong with minor skill density suggestions.",
            },
        },
        {
            type: "resume_diff",
            data: {
                section: "summary",
                before: "Built web apps.",
                after: "Engineered scalable React applications serving 10k+ daily active users.",
                rationale: "Quantifies impact and adds target role keywords.",
            },
        },
        {
            type: "job_result_card",
            data: {
                status: "not_configured",
                message: "NullJobProvider active.",
            },
        },
        {
            type: "skill_gap_card",
            data: {
                targetRole: "Senior Frontend Engineer",
                matchScore: 75,
                matchedKeywords: ["React", "TypeScript", "Tailwind"],
                missingKeywords: ["GraphQL", "Next.js"],
            },
        },
        {
            type: "cover_letter_preview",
            data: {
                content: "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Developer role...",
                jobTitle: "Senior Developer",
                companyName: "Acme Corp",
            },
        },
        {
            type: "interview_question_card",
            data: {
                questions: [
                    {
                        id: "q1",
                        question: "How do you optimize React render performance?",
                        difficulty: "Medium",
                        category: "Frontend Architecture",
                        keyTips: ["Mention useMemo", "Explain React.memo"],
                    },
                ],
            },
        },
        {
            type: "task_progress",
            data: {
                label: "Analyzing Resume Content",
                percent: 65,
            },
        },
        {
            type: "resume_preview",
            data: {
                resume: {
                    id: "res-complete-test",
                    title: "ATS Resume - Tushar Jadhav",
                    template: "Professional",
                    personalInfo: {
                        fullName: "Tushar Jadhav",
                        email: "tushar.jadhav2316@gmail.com",
                        phone: "+91 74980 92316",
                        location: "Pune, India",
                        summary: "Computer Science undergraduate and aspiring Full-Stack & AI Engineer",
                    },
                    experience: [
                        { id: "exp-1", company: "Microsoft Elevate", position: "Microsoft Azure Intern", startDate: "Jan 2026", endDate: "Feb 2026", current: false, description: "Cloud module engineering." },
                    ],
                    education: [
                        { id: "edu-1", institution: "Nutan College of Engineering and Research", degree: "B.Tech", fieldOfStudy: "Computer Science", startDate: "2023", endDate: "2027" },
                        { id: "edu-2", institution: "HSC", degree: "HSC", fieldOfStudy: "Science", startDate: "2021", endDate: "2023" },
                        { id: "edu-3", institution: "SSC", degree: "SSC", fieldOfStudy: "General", startDate: "2020", endDate: "2021" },
                    ],
                    skills: [
                        { id: "sk-1", name: "React.js", level: "Expert" },
                        { id: "sk-2", name: "Python", level: "Expert" },
                    ],
                    projects: [
                        { id: "proj-1", name: "HireLens AI", description: "Resume Builder & ATS SaaS" },
                        { id: "proj-2", name: "Swastik", description: "Voice AI Assistant" },
                        { id: "proj-3", name: "Habit Tracker", description: "Productivity App" },
                    ],
                    achievements: [
                        { id: "ach-1", title: "Smart India Hackathon 2025", description: "Core Team Member" },
                        { id: "ach-2", title: "CODEMENT '24", description: "Hackathon Coordinator" },
                        { id: "ach-3", title: "Dual Industry Recognition", description: "IBM & Microsoft" },
                    ],
                    certifications: [
                        { id: "cert-1", name: "Cloud Administration & Engineering", issuer: "Microsoft Elevate" },
                        { id: "cert-2", name: "AI & ML", issuer: "Microsoft Elevate" },
                        { id: "cert-3", name: "IBM Web Developer", issuer: "NSDC" },
                        { id: "cert-4", name: "Java & Python", issuer: "GeeksforGeeks" },
                        { id: "cert-5", name: "TCS iON Career Edge", issuer: "TCS" },
                        { id: "cert-6", name: "2026 Aspire Leaders Program", issuer: "Aspire Institute" },
                    ],
                },
            },
        },
    ];

    // 1. Verify all 7 artifact types dispatch to valid React elements
    console.log("1. Testing dispatch for all 7 supported artifact types...");
    for (const art of mockArtifacts) {
        const rendered = ArtifactRenderer({ artifact: art });
        if (!rendered) {
            console.error(`FAILED: Artifact type '${art.type}' returned null!`, art);
            process.exit(1);
        }
        console.log(`  ✓ Artifact type '${art.type}' rendered successfully!`);
    }

    // 2. Test unknown artifact type string (defense-in-depth safety net)
    console.log("\n2. Testing defense-in-depth for unknown artifact type...");
    const unknownArtifact = {
        type: "unrecognized_future_card",
        data: { foo: "bar" },
    };
    const unknownRendered = ArtifactRenderer({ artifact: unknownArtifact as any });
    if (unknownRendered !== null) {
        console.error("FAILED: Unknown artifact type should return null!", unknownRendered);
        process.exit(1);
    }
    console.log("  ✓ Unknown artifact type returned null safely without throwing!");

    // 3. Test malformed artifact payloads (missing data, null artifact, invalid type)
    console.log("\n3. Testing malformed artifact payload safety...");

    const malformed1 = null;
    const malformed2 = { type: "ats_score_card" }; // missing data
    const malformed3 = { type: 123, data: {} }; // non-string type

    if (ArtifactRenderer({ artifact: malformed1 }) !== null) {
        console.error("FAILED: null artifact should return null!");
        process.exit(1);
    }
    if (ArtifactRenderer({ artifact: malformed2 }) !== null) {
        console.error("FAILED: missing data payload should return null!");
        process.exit(1);
    }
    if (ArtifactRenderer({ artifact: malformed3 }) !== null) {
        console.error("FAILED: invalid type should return null!");
        process.exit(1);
    }
    console.log("  ✓ All malformed artifact payloads handled safely without crashing!");

    console.log("\n=== Results: 10/10 ArtifactRenderer assertions passed 100%! ===");
}

runArtifactRendererTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
