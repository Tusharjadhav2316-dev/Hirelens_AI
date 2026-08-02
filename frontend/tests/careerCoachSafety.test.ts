import {
    buildResumeContextBlock,
    buildATSContextBlock,
    buildJDContextBlock,
    trimConversationHistory,
    hasResumeContent,
    ChatMessage,
    ATSContextInput
} from "../lib/careerCoachService";
import { CAREER_COACH_SYSTEM_PROMPT, CAREER_COACH_MODEL_PARAMS, HALLUCINATION_GUARDRAIL } from "../lib/promptTemplates";
import { defaultResume } from "../lib/defaultResume";
import { Resume } from "../types/resume";

console.log("=== Career Coach Safety Test Suite ===\n");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        passCount++;
        console.log(`  ✓ ${message}`);
    } else {
        failCount++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

// ----------------------------------------------------------------------------
// 1. System Prompt Truth-Preservation Rules
// ----------------------------------------------------------------------------
console.log("1. System prompt truth-preservation rules:");
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("NEVER invent"),
    "System prompt contains 'NEVER invent' instruction"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("NEVER recalculate, re-estimate, fabricate, or contradict them"),
    "System prompt explicitly prohibits fabricating ATS scores"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("NEVER claim to have searched"),
    "System prompt prohibits claiming external searches"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes(HALLUCINATION_GUARDRAIL),
    "System prompt includes HALLUCINATION_GUARDRAIL"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("DETERMINISTIC ENGINE") || CAREER_COACH_SYSTEM_PROMPT.includes("deterministic HireLens outputs"),
    "System prompt instructs AI to treat deterministic outputs as authoritative"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("According to your HireLens ATS analysis"),
    "System prompt instructs AI to attribute ATS scores correctly"
);
assert(
    CAREER_COACH_SYSTEM_PROMPT.includes("HireLens Career Coach"),
    "System prompt defines AI identity as HireLens Career Coach"
);

// ----------------------------------------------------------------------------
// 2. Career Coach Model Parameters
// ----------------------------------------------------------------------------
console.log("\n2. Career Coach model parameters:");
assert(
    CAREER_COACH_MODEL_PARAMS.max_tokens >= 400,
    "max_tokens is set and at least 400"
);
assert(
    CAREER_COACH_MODEL_PARAMS.temperature > 0 && CAREER_COACH_MODEL_PARAMS.temperature <= 1,
    "temperature is set and in valid range (0, 1]"
);

// ----------------------------------------------------------------------------
// 3. buildResumeContextBlock
// ----------------------------------------------------------------------------
console.log("\n3. buildResumeContextBlock:");
const samplePopulatedResume: Resume = {
    id: "res-1",
    title: "Senior Full Stack Resume",
    template: "modern",
    personalInfo: {
        fullName: "Alex Rivera",
        email: "alex@example.com",
        phone: "555-0199",
        location: "San Francisco, CA",
        portfolioUrl: "https://alex.dev",
        linkedinUrl: "https://linkedin.com/in/alex",
        summary: "Senior Full Stack Engineer with 5+ years of experience building Java and TypeScript web apps."
    },
    experience: [
        {
            id: "exp-1",
            company: "Tech Corp",
            position: "Senior Engineer",
            startDate: "2021",
            endDate: "Present",
            current: true,
            description: "Led team of 4 engineers building high-throughput REST APIs using Spring Boot and React."
        }
    ],
    education: [
        {
            id: "edu-1",
            institution: "UC Berkeley",
            degree: "B.S.",
            fieldOfStudy: "Computer Science",
            startDate: "2016",
            endDate: "2020"
        }
    ],
    skills: [
        { id: "sk-1", name: "Java", level: "Expert" },
        { id: "sk-2", name: "TypeScript", level: "Intermediate" },
        { id: "sk-3", name: "Spring Boot", level: "Expert" }
    ],
    projects: [
        {
            id: "proj-1",
            name: "HireLens AI Platform",
            description: "Built real-time resume analysis engine."
        }
    ],
    achievements: [
        { id: "ach-1", title: "Engineer of the Year 2023", description: "Recognized for architecture excellence." }
    ],
    certifications: [
        { id: "cert-1", name: "AWS Solutions Architect", issuer: "Amazon" }
    ]
};

const resumeBlock = buildResumeContextBlock(samplePopulatedResume);

assert(resumeBlock.length > 0, "Returns a non-empty string for a populated resume");
assert(resumeBlock.includes("Name: Alex Rivera"), "Includes candidate name header");
assert(resumeBlock.includes("Skills: Java, TypeScript, Spring Boot"), "Includes skills section header");
assert(!resumeBlock.includes('{"id":') && !resumeBlock.includes('[{'), "Does not contain raw JSON serialization");
assert(resumeBlock.length < 4000, "Context block length is well under 4000 characters");
assert(buildResumeContextBlock(defaultResume) === "", "Returns empty string for a resume with no content");

const longDescResume: Resume = {
    ...samplePopulatedResume,
    experience: [
        {
            ...samplePopulatedResume.experience[0],
            description: "A".repeat(1500)
        }
    ]
};
const longBlock = buildResumeContextBlock(longDescResume);
assert(longBlock.length < 3000, "Truncates overly long section descriptions appropriately");

// ----------------------------------------------------------------------------
// 4. buildATSContextBlock
// ----------------------------------------------------------------------------
console.log("\n4. buildATSContextBlock:");
const atsData: ATSContextInput = {
    overallScore: 72.5,
    sectionScores: { summary: 70, skills: 80, experience: 75, projects: 65, education: 70 },
    keywordDensityScore: 75,
    impactScore: 68,
    completenessScore: 74,
    warnings: ["Impact statements lack quantified metrics"],
    suggestions: ["Add quantifiable metrics to Work Experience bullet points"]
};

const atsBlock = buildATSContextBlock(atsData);

assert(atsBlock.includes("DETERMINISTIC ENGINE OUTPUT"), "ATS context includes 'DETERMINISTIC ENGINE OUTPUT' label");
assert(atsBlock.includes("not by AI estimation"), "ATS context states score is not by AI estimation");
assert(atsBlock.includes("Overall ATS Score: 73/100"), "Formats rounded overall score (73 for 72.5)");
assert(atsBlock.includes("Warnings:") && atsBlock.includes("Impact statements lack quantified metrics"), "Includes warnings list");
assert(atsBlock.includes("Top Suggestions:") && atsBlock.includes("Add quantifiable metrics"), "Includes top suggestions list");

// ----------------------------------------------------------------------------
// 5. buildJDContextBlock
// ----------------------------------------------------------------------------
console.log("\n5. buildJDContextBlock:");
assert(buildJDContextBlock("") === "", "Returns empty string for empty JD");
assert(buildJDContextBlock("Short JD") === "", "Returns empty string for JD under 20 characters");

const sampleJD = "We are seeking a Senior Java Full Stack Developer with experience in Spring Boot, React, and Kubernetes to join our core engineering team.";
const jdBlock = buildJDContextBlock(sampleJD);

assert(jdBlock.includes("TARGET JOB DESCRIPTION"), "Includes TARGET JOB DESCRIPTION header for valid JD");
assert(jdBlock.includes("do not claim the candidate has skills"), "Includes instruction prohibiting claiming unlisted candidate skills");

const longJD = "Job Requirement: " + "Senior Developer with skills in Java, React, Python, AWS. ".repeat(60);
const truncatedJDBlock = buildJDContextBlock(longJD);
assert(truncatedJDBlock.length <= 2200, "Truncates job descriptions exceeding max length cap");

// ----------------------------------------------------------------------------
// 6. trimConversationHistory
// ----------------------------------------------------------------------------
console.log("\n6. trimConversationHistory:");
const shortHistory: ChatMessage[] = [
    { id: "1", role: "user", content: "Hello" },
    { id: "2", role: "assistant", content: "Hi there!" }
];

const trimmedShort = trimConversationHistory(shortHistory, 8);
assert(trimmedShort.length === 2, "Returns all messages when under the limit");

const limitHistory: ChatMessage[] = Array.from({ length: 16 }, (_, i) => ({
    id: `m-${i + 1}`,
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Msg ${i + 1}`
}));

const trimmedLimit = trimConversationHistory(limitHistory, 8);
assert(trimmedLimit.length === 16, "Preserves exactly-at-limit 16 messages (8 turns)");

const overLimitHistory: ChatMessage[] = Array.from({ length: 24 }, (_, i) => ({
    id: `m-${i + 1}`,
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Msg ${i + 1}`
}));

const trimmedOver = trimConversationHistory(overLimitHistory, 8);
assert(trimmedOver.length === 16, "Trims 24 messages down to 16 (last 8 turns)");
assert(trimmedOver[0].id === "m-9", "Keeps the most recent 16 messages");
assert(trimConversationHistory([]).length === 0, "Handles empty input array cleanly");

// ----------------------------------------------------------------------------
// 7. hasResumeContent
// ----------------------------------------------------------------------------
console.log("\n7. hasResumeContent:");
assert(hasResumeContent(samplePopulatedResume) === true, "Returns true for a populated resume");

const nameOnlyResume: Resume = {
    ...defaultResume,
    personalInfo: { ...defaultResume.personalInfo, fullName: "John Smith" }
};
assert(hasResumeContent(nameOnlyResume) === true, "Returns true for name-only resume");
assert(hasResumeContent(defaultResume) === false, "Returns false for completely empty resume");

// ----------------------------------------------------------------------------
// 8. Manual QA Cases (run in browser with a real account)
// ----------------------------------------------------------------------------
console.log("\n8. Manual QA cases (run in browser with a real account):");
console.log("   [C1] Coach must not fabricate skills absent from resume");
console.log("   [C2] ATS score attribution (must reference deterministic engine)");
console.log("   [C3] No invented metrics or qualifications");
console.log("   [C4] Off-topic query redirect to career/resume subjects");
console.log("   [C5] Empty resume handling (asks user to load details)");

console.log(`\n=== Career Coach Safety Results ===`);
console.log(`Automated Assertions: ${passCount} passed, ${failCount} failed`);
console.log(`Manual QA Cases: 5 documented for browser verification`);

if (failCount === 0) {
    console.log(`✓ All automated assertions passed.`);
    console.log(`  Complete manual QA cases C1–C5 in the browser before marking Sprint 6 Done.`);
} else {
    console.error(`✗ ${failCount} assertions failed!`);
    process.exit(1);
}
