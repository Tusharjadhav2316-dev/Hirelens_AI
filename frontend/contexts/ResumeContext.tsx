"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Resume } from "@/types/resume";
import { defaultResume } from "@/lib/defaultResume";

interface ResumeContextType {
    resume: Resume;
    updateResume: (updates: Partial<Resume>) => void;
    setResume: (resume: Resume) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
    const [resume, setResume] = useState<Resume>(defaultResume);

    const updateResume = (updates: Partial<Resume>) => {
        setResume((prev) => ({ ...prev, ...updates }));
    };

    return (
        <ResumeContext.Provider value={{ resume, updateResume, setResume }}>
            {children}
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error("useResume must be used within a ResumeProvider");
    }
    return context;
}
