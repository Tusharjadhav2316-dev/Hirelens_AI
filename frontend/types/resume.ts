export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl: string;
    linkedinUrl: string;
    summary: string;
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa?: string;
}

export interface Skill {
    id: string;
    name: string;
    level: "Beginner" | "Intermediate" | "Expert";
}

export interface Project {
    id: string;
    name: string;
    description: string;
    githubUrl?: string;
    liveUrl?: string;
    technologies?: string[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    year?: string;
}

export interface Resume {
    id: string;
    title: string;
    template: string;
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    achievements: Achievement[];
    certifications: Certification[];
}
