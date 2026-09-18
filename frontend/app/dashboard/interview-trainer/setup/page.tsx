"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Target,
  Compass,
} from "lucide-react";
import RoleInput from "@/components/interview-trainer/RoleInput";
import InterviewConfigForm, {
  InterviewType,
  InterviewDifficulty,
  TrainingMode,
} from "@/components/interview-trainer/InterviewConfigForm";
import MediaConsentPanel from "@/components/interview-trainer/MediaConsentPanel";
import { useResume } from "@/contexts/ResumeContext";
import { createTrainerSession } from "@/lib/interviewTrainerSessionService";

export default function InterviewTrainerSetupPage() {
  const router = useRouter();
  const { resume } = useResume();

  // Form State
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("intermediate");
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("coaching");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Validation & UI State
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [strategyPreview, setStrategyPreview] = useState<{
    target_role: string;
    role_summary: string;
    likely_competencies: string[];
    interview_categories: { category: string; weight: number }[];
    technical_balance: string;
    suggested_topics: string[];
    evidence_basis: string;
    assumptions: string[];
  } | null>(null);

  const handleRoleChange = (val: string) => {
    setRole(val);
    if (val.trim()) {
      setRoleError(null);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!strategyPreview) return;
    try {
      setIsSaving(true);

      const timestamp = Date.now();
      const initialQuestions = [
        {
          id: `q_${timestamp}_1`,
          question: `Tell me about your background and what excites you about pursuing a career as a ${strategyPreview.target_role}.`,
          category: "Domain Knowledge",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_2`,
          question: `What is the most challenging technical or operational problem you've encountered relevant to ${strategyPreview.target_role}, and how did you resolve it?`,
          category: "Problem Solving",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_3`,
          question: `Describe a situation where you had to collaborate with a cross-functional team under tight deadlines. What approach did you take?`,
          category: "Behavioral & Leadership",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_4`,
          question: `How do you measure success and ensure high quality when executing deliverables as a ${strategyPreview.target_role}?`,
          category: "Operational Execution",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_5`,
          question: `Where do you see the industry heading in the next 2-3 years, and how are you preparing yourself for emerging trends in ${strategyPreview.target_role}?`,
          category: "Adaptability & Strategy",
          difficulty: difficulty,
        },
      ];

      const createdSession = await createTrainerSession({
        target_role: strategyPreview.target_role,
        interview_type: interviewType,
        difficulty: difficulty,
        training_mode: trainingMode,
        role_intelligence: {
          target_role: strategyPreview.target_role,
          role_summary: strategyPreview.role_summary,
          likely_competencies: strategyPreview.likely_competencies,
          interview_categories: strategyPreview.interview_categories,
          technical_balance: strategyPreview.technical_balance as any,
          suggested_topics: strategyPreview.suggested_topics,
          evidence_basis: strategyPreview.evidence_basis as any,
          assumptions: strategyPreview.assumptions,
        },
        questions_asked: initialQuestions,
        voice_enabled: micEnabled,
        camera_enabled: cameraEnabled,
      });

      router.push(`/dashboard/interview-trainer/room?sessionId=${encodeURIComponent(createdSession.session_id)}`);
    } catch (err: any) {
      alert(`Failed to save session: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      setRoleError("Target role is required. Please type your desired role to proceed.");
      return;
    }

    setRoleError(null);
    setIsAnalyzing(true);

    try {
      // Dynamic role decomposition for preview
      const cleanRole = role.trim();
      const hasJd = jobDescription.trim().length > 20;

      // Determine balance heuristic for client strategy preview
      const lower = cleanRole.toLowerCase();
      const isTech = ["engineer", "developer", "architect", "data scientist", "ml", "devops", "cloud", "software", "programmer"].some((k) => lower.includes(k));
      const isNonTech = ["teacher", "educator", "sales", "recruiter", "counselor", "nurse", "therapist", "designer", "artist"].some((k) => lower.includes(k));
      const balance = isTech ? "mostly_technical" : isNonTech ? "mostly_non_technical" : "balanced";

      const previewData = {
        target_role: cleanRole,
        role_summary: `Tailored interview strategy for ${cleanRole} focusing on ${interviewType} competencies and ${difficulty} difficulty.`,
        likely_competencies: [
          `${cleanRole} Core Domain Expertise`,
          "Analytical Problem Solving & Strategy",
          "Cross-Functional Communication & Teamwork",
          "Operational Execution & Impact",
        ],
        interview_categories: [
          { category: "Core Domain & Functional Knowledge", weight: 0.35 },
          { category: "Applied Problem Solving & Execution", weight: 0.25 },
          { category: "Behavioral & Leadership Scenarios", weight: 0.25 },
          { category: "Adaptability & Communication", weight: 0.15 },
        ],
        technical_balance: balance,
        suggested_topics: [
          `Core methodologies and practices relevant to ${cleanRole}`,
          "Navigating complex, ambiguous workplace scenarios",
          "Evaluating trade-offs and delivering measurable results",
        ],
        evidence_basis: hasJd ? "job_description" : "role_inference",
        assumptions: hasJd
          ? []
          : [
              `Assumed standard market competency expectations for ${cleanRole}.`,
              "Assumed standard mid-level proficiency requirements.",
              "No specific employer constraints provided; generalized for industry standard.",
            ],
      };

      // Set simulated dynamic preview
      setTimeout(() => {
        setStrategyPreview(previewData);
        setIsAnalyzing(false);
      }, 400);
    } catch (err) {
      console.error("Role analysis error", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard/interview-trainer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interview Trainer</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Interview Setup & Role Strategy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your target role, evaluation mode, and multimodal privacy preferences.
        </p>
      </div>

      <form onSubmit={handleAnalyzeAndPreview} className="space-y-8">
        {/* Step 1: Target Role & JD */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Role Specification
            </h2>
          </div>
          <RoleInput
            role={role}
            onRoleChange={handleRoleChange}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            error={roleError || undefined}
          />
        </div>

        {/* Step 2: Training Mode & Parameters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Training Mode & Configuration
            </h2>
          </div>
          <InterviewConfigForm
            interviewType={interviewType}
            onTypeChange={setInterviewType}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            trainingMode={trainingMode}
            onModeChange={setTrainingMode}
          />
        </div>

        {/* Step 3: Media & Consent */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Media & Privacy Controls
            </h2>
          </div>
          <MediaConsentPanel
            micEnabled={micEnabled}
            onMicToggle={setMicEnabled}
            cameraEnabled={cameraEnabled}
            onCameraToggle={setCameraEnabled}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Role Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Strategy Preview</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Strategy Preview Card (if generated) */}
      {strategyPreview && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Role Intelligence Preview
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {strategyPreview.target_role}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {strategyPreview.evidence_basis === "job_description" ? "Job Description Grounded" : "Universal Role Inference"}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {strategyPreview.role_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Competencies */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Core Competencies Evaluated
              </h4>
              <ul className="space-y-1.5">
                {strategyPreview.likely_competencies.map((comp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evaluation Categories & Weights */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category Weights
              </h4>
              <div className="space-y-2">
                {strategyPreview.interview_categories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{Math.round(cat.weight * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{ width: `${Math.round(cat.weight * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transparent Assumptions (if no JD) */}
          {strategyPreview.assumptions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Explicit Strategy Assumptions (No JD Provided)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-900/80 dark:text-amber-300/80 space-y-0.5">
                {strategyPreview.assumptions.map((assump, idx) => (
                  <li key={idx}>{assump}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Final Ready State Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Session will be securely persisted to your private training history.</span>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleConfirmAndSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Session to Firestore...</span>
                </>
              ) : (
                <>
                  <span>Confirm Strategy & Save Setup</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
