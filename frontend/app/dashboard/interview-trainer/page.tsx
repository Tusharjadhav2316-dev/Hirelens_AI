"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import InterviewTrainerHeader from "@/components/interview-trainer/InterviewTrainerHeader";
import PracticeModesRow, { PracticeMode } from "@/components/interview-trainer/PracticeModesRow";
import InterviewTypeGrid, { InterviewTypeOption } from "@/components/interview-trainer/InterviewTypeGrid";
import InterviewSettingsCard, {
  DifficultyLevel,
  QuestionCountOption,
  TimePerQuestionOption,
} from "@/components/interview-trainer/InterviewSettingsCard";
import StartInterviewBar from "@/components/interview-trainer/StartInterviewBar";
import RecentSessionsList from "@/components/interview-trainer/RecentSessionsList";
import YourProgressCard from "@/components/interview-trainer/YourProgressCard";
import {
  listTrainerSessions,
  deleteTrainerSession,
  createTrainerSession,
} from "@/lib/interviewTrainerSessionService";
import { InterviewTrainerSession } from "@/types/agent";
import { toast } from "sonner";

export default function InterviewTrainerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { resume } = useResume();

  // Sessions History State
  const [sessions, setSessions] = useState<InterviewTrainerSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("mock");
  const [selectedType, setSelectedType] = useState<InterviewTypeOption>("technical");
  const [targetRole, setTargetRole] = useState(
    resume.title || (resume.experience?.[0]?.position) || "Senior Frontend Engineer"
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>(5);
  const [timePerQuestion, setTimePerQuestion] = useState<TimePerQuestionOption>(3);
  const [focusTopics, setFocusTopics] = useState<string[]>([
    "React",
    "System Design",
    "Web Performance",
    "Behavioral & STAR",
  ]);
  const [isStarting, setIsStarting] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);

  // Load Real Sessions
  const fetchSessions = async () => {
    if (!user) {
      setLoadingSessions(false);
      return;
    }
    try {
      setLoadingSessions(true);
      const data = await listTrainerSessions(20);
      setSessions(data);
    } catch (err) {
      console.error("Failed to load past sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // Focus Topics Handler
  const handleAddFocusTopic = (topic: string) => {
    if (!focusTopics.includes(topic)) {
      setFocusTopics((prev) => [...prev, topic]);
      toast.success(`Added focus topic: ${topic}`);
    }
  };

  const handleRemoveFocusTopic = (topic: string) => {
    setFocusTopics((prev) => prev.filter((t) => t !== topic));
    toast.info(`Removed topic: ${topic}`);
  };

  // Delete Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this training session? Transcripts will be removed.")) {
      return;
    }
    try {
      setDeletingId(sessionId);
      await deleteTrainerSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      toast.success("Session deleted");
    } catch (err) {
      toast.error("Failed to delete session. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Scroll to History
  const handleScrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Start Real Interview Session
  const handleStartInterview = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role before starting.");
      return;
    }

    setIsStarting(true);
    try {
      const timestamp = Date.now();
      const mappedInterviewType =
        selectedType === "technical"
          ? "technical"
          : selectedType === "behavioral"
          ? "behavioral"
          : selectedType === "company_specific"
          ? "role_specific"
          : "mixed";

      // Generate initial questions based on configuration and focus topics
      const initialQuestions = [
        {
          id: `q_${timestamp}_1`,
          question: `Tell me about your technical background and what motivates you to excel as a ${targetRole}.`,
          category: "Domain Expertise",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_2`,
          question: `How do you architect applications when optimizing for ${focusTopics[0] || "core performance"} and reliability?`,
          category: "System Design",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_3`,
          question: `Describe a scenario where you faced conflicting requirements or a technical trade-off. How did you resolve it?`,
          category: "Problem Solving",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_4`,
          question: `What strategies do you use when collaborating with cross-functional product teams under aggressive deadlines?`,
          category: "Behavioral & Leadership",
          difficulty: difficulty,
        },
        {
          id: `q_${timestamp}_5`,
          question: `How do you ensure high code quality, automated test coverage, and continuous delivery in production?`,
          category: "Operational Execution",
          difficulty: difficulty,
        },
      ].slice(0, questionCount);

      const createdSession = await createTrainerSession({
        target_role: targetRole.trim(),
        interview_type: mappedInterviewType,
        difficulty: difficulty,
        training_mode: selectedMode === "mock" ? "realistic_mock" : "coaching",
        role_intelligence: {
          target_role: targetRole.trim(),
          role_summary: `AI interview evaluation for ${targetRole} focusing on ${selectedType} competencies.`,
          likely_competencies: focusTopics,
          interview_categories: [
            { category: "Domain Knowledge", weight: 0.35 },
            { category: "System Architecture", weight: 0.25 },
            { category: "Behavioral STAR", weight: 0.25 },
            { category: "Delivery Pacing", weight: 0.15 },
          ],
          technical_balance: selectedType === "technical" ? "mostly_technical" : "balanced",
          suggested_topics: focusTopics,
          evidence_basis: "role_inference",
          assumptions: [],
        },
        questions_asked: initialQuestions,
        voice_enabled: true,
        camera_enabled: false,
      });

      toast.success("Interview session initialized!");
      router.push(`/dashboard/interview-trainer/room?sessionId=${encodeURIComponent(createdSession.session_id)}`);
    } catch (err: any) {
      console.error("Start interview error:", err);
      toast.error(err.message || "Failed to start interview session.");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Header matching PDF Page 6 */}
      <InterviewTrainerHeader
        onViewHistoryClick={handleScrollToHistory}
        sessionCount={sessions.length}
      />

      {/* 2. Row 1: 3 Practice Modes + Why AI Card */}
      <PracticeModesRow
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
      />

      {/* 3. Interview Type Grid (5 Cards) */}
      <InterviewTypeGrid
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* 4. Settings & Focus Areas */}
      <InterviewSettingsCard
        targetRole={targetRole}
        onTargetRoleChange={setTargetRole}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        questionCount={questionCount}
        onQuestionCountChange={setQuestionCount}
        timePerQuestion={timePerQuestion}
        onTimePerQuestionChange={setTimePerQuestion}
        focusTopics={focusTopics}
        onAddFocusTopic={handleAddFocusTopic}
        onRemoveFocusTopic={handleRemoveFocusTopic}
      />

      {/* 5. Start Interview Full-Width Gradient Bar */}
      <StartInterviewBar
        targetRole={targetRole}
        interviewType={selectedType}
        difficulty={difficulty}
        questionCount={questionCount}
        isLoading={isStarting}
        onStartInterview={handleStartInterview}
      />

      {/* 6. Bottom Analytics Section */}
      <div ref={historyRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Practice Sessions (7 Cols) */}
        <div className="lg:col-span-7">
          <RecentSessionsList
            sessions={sessions}
            loading={loadingSessions}
            deletingId={deletingId}
            onDeleteSession={handleDeleteSession}
            onStartNew={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </div>

        {/* Your Progress Donut & Breakdown (5 Cols) */}
        <div className="lg:col-span-5">
          <YourProgressCard sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
