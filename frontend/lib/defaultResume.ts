import { Resume } from "@/types/resume";

export const defaultResume: Resume = {
    id: "",
    title: "Untitled Resume",
    template: "modern", // Selected template stored in the schema
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        portfolioUrl: "",
        linkedinUrl: "",
        summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
};
