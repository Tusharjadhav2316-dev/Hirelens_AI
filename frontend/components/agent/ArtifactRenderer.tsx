"use client";

import React from "react";
import { Artifact } from "@/types/agent";
import ATSScoreCard from "./artifacts/ATSScoreCard";
import ResumeDiffCard from "./artifacts/ResumeDiffCard";
import JobResultCard from "./artifacts/JobResultCard";
import SkillGapCard from "./artifacts/SkillGapCard";
import CoverLetterPreview from "./artifacts/CoverLetterPreview";
import InterviewQuestionCard from "./artifacts/InterviewQuestionCard";
import InterviewFeedbackCard from "./artifacts/InterviewFeedbackCard";
import InterviewReportCard from "./artifacts/InterviewReportCard";
import TaskProgress from "./artifacts/TaskProgress";
import ResumePreviewCard from "./artifacts/ResumePreviewCard";

interface ArtifactRendererProps {
    artifact: Artifact | any;
    onImproveResume?: () => void;
    onSubmitInterviewAnswer?: (answer: string) => void;
    onCancelInterview?: () => void;
    isSubmittingAnswer?: boolean;
}

export function ArtifactRenderer({
    artifact,
    onImproveResume,
    onSubmitInterviewAnswer,
    onCancelInterview,
    isSubmittingAnswer = false,
}: ArtifactRendererProps) {
    // 1. Runtime validation for untrusted NDJSON payload data
    if (!artifact || typeof artifact !== "object" || typeof artifact.type !== "string") {
        console.warn("[ArtifactRenderer] Malformed artifact ignored (missing object or type):", artifact);
        return null;
    }

    if (!artifact.data || typeof artifact.data !== "object") {
        console.warn("[ArtifactRenderer] Malformed artifact ignored (missing data payload):", artifact);
        return null;
    }

    // 2. Closed discriminated union switch with exhaustive type checking
    const typedArtifact = artifact as Artifact;

    try {
        switch (typedArtifact.type) {
            case "ats_score_card":
                return <ATSScoreCard data={typedArtifact.data} onImproveResume={onImproveResume} />;

            case "resume_diff":
                return <ResumeDiffCard data={typedArtifact.data} />;

            case "job_result_card":
                return <JobResultCard data={typedArtifact.data} />;

            case "skill_gap_card":
                return <SkillGapCard data={typedArtifact.data} />;

            case "cover_letter_preview":
                return <CoverLetterPreview data={typedArtifact.data} />;

            case "interview_question_card":
                return (
                    <InterviewQuestionCard
                        data={typedArtifact.data}
                        onSubmitAnswer={onSubmitInterviewAnswer}
                        onCancelInterview={onCancelInterview}
                        isSubmitting={isSubmittingAnswer}
                    />
                );

            case "interview_feedback_card":
                return <InterviewFeedbackCard data={typedArtifact.data} />;

            case "interview_report_card":
                return (
                    <InterviewReportCard
                        data={typedArtifact.data}
                        onImproveResume={onImproveResume}
                    />
                );

            case "task_progress":
                return <TaskProgress data={typedArtifact.data} />;

            case "resume_preview":
                return <ResumePreviewCard data={typedArtifact.data} />;

            default: {
                // Defense-in-depth: unknown artifact type returns null safely, never raw JSON/HTML
                const unknownType = (typedArtifact as any).type;
                console.warn(`[ArtifactRenderer] Unknown artifact type '${unknownType}' received - safely ignored.`);
                return null;
            }
        }
    } catch (renderError) {
        console.error(`[ArtifactRenderer] Error rendering artifact type '${typedArtifact.type}':`, renderError);
        return (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 border border-slate-200 dark:border-slate-700">
                This artifact could not be displayed.
            </div>
        );
    }
}

export default ArtifactRenderer;
