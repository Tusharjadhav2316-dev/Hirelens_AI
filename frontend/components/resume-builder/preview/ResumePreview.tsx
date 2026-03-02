import { Resume } from "@/types/resume";
import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import MinimalistTemplate from "./templates/MinimalistTemplate";

interface Props {
    resume: Resume;
}

// A purely presentational switch statement that renders a template depending on resume.template
export default function ResumePreview({ resume }: Props) {
    if (!resume) return null;

    switch (resume.template) {
        case "modern":
            return <ModernTemplate resume={resume} />;
        case "professional":
            return <ProfessionalTemplate resume={resume} />;
        case "minimalist":
            return <MinimalistTemplate resume={resume} />;
        default:
            return <ModernTemplate resume={resume} />;
    }
}
