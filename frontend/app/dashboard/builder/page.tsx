import ResumeEditor from "@/components/resume-builder/ResumeEditor";

export const metadata = {
    title: "Resume Builder | HireLens AI",
    description: "Create your ATS-optimized resume",
};

export default function ResumeBuilderPage() {
    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Builder</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Craft an ATS-optimized resume using AI guidance
                    </p>
                </div>
            </div>

            <ResumeEditor />
        </div>
    );
}
