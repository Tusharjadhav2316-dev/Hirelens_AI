export interface GenerateCoverLetterParams {
    resumeText?: string;
    customInput?: string;
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    tone: string;
}

export interface ImproveCoverLetterParams {
    currentText: string;
    action: "improve" | "shorten" | "impactful";
}

export async function generateCoverLetter(params: GenerateCoverLetterParams): Promise<string> {
    const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", ...params }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter.");
    }
    return data.content;
}

export async function processCoverLetterAction(params: ImproveCoverLetterParams): Promise<string> {
    const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to process cover letter action.");
    }
    return data.content;
}
