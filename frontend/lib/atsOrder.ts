export const ATS_SECTION_ORDER = [
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "achievements"
] as const;

export type AtsSection = typeof ATS_SECTION_ORDER[number];
