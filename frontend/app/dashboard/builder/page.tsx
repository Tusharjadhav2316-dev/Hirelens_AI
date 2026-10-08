import ResumeEditor from "@/components/resume-builder/ResumeEditor";

export const metadata = {
    title: "Resume Builder | HireLens AI",
    description: "Create your ATS-optimized resume with AI guidance",
};

export default function ResumeBuilderPage() {
    return (
        <div className="h-full flex flex-col">
            <ResumeEditor />
        </div>
    );
}
