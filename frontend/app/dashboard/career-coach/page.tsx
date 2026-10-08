"use client";

import React, { useState, useRef } from "react";
import CareerCoachHeader from "@/components/career-coach/CareerCoachHeader";
import CoachingTopicRail from "@/components/career-coach/CoachingTopicRail";
import CareerCoachConversation from "@/components/career-coach/CareerCoachConversation";
import CareerCoachComposer from "@/components/career-coach/CareerCoachComposer";
import RoadmapDetailsModal from "@/components/career-coach/RoadmapDetailsModal";
import {
  CAREER_COACH_TOPICS,
  CareerCoachTopicConfig,
} from "@/components/career-coach/CareerCoachConfig";
import {
  CoachMessage,
  RoadmapStep,
  CareerRoadmap,
} from "@/components/career-coach/CareerCoachTypes";
import { toast } from "sonner";

export default function CareerCoachPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("career-planning");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Topic Configuration
  const activeTopic: CareerCoachTopicConfig =
    CAREER_COACH_TOPICS[selectedTopicId] || CAREER_COACH_TOPICS["career-planning"];

  // Active Roadmap Object derived from activeTopic (Always initialized starting at Step 1)
  const activeRoadmap: CareerRoadmap = {
    id: activeTopic.id,
    roleTitle: activeTopic.roadmapTitle,
    industry: "Strategic Career Planning",
    level: activeTopic.roadmapLevel,
    totalSteps: activeTopic.roadmapSteps.length,
    currentStepIndex: 0, // Step 1 is active (index 0)
    steps: activeTopic.roadmapSteps,
  };

  // Handle Coaching Topic Selection (resets state cleanly to Step 1)
  const handleSelectTopic = (topic: CareerCoachTopicConfig) => {
    if (topic.id === selectedTopicId) return;
    setSelectedTopicId(topic.id);
    setMessages([]); // Reset conversation context for the newly selected topic
    toast.info(`Coaching focus set to ${topic.name}`);
  };

  // Handle Send Message / Query
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isStreaming) return;

    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsStreaming(true);

    // Provide structured strategist guidance for Sprint 11 interaction foundation
    setTimeout(() => {
      let coachReply = "";
      const lower = text.toLowerCase();

      if (lower.includes("roadmap") || lower.includes("plan") || lower.includes("goal")) {
        coachReply = `Under the **${activeTopic.name}** framework, I have structured your initial roadmap around: **${activeTopic.roadmapTitle}**.\n\nYour immediate starting focus is **Step 01 (${activeTopic.roadmapSteps[0].title})**. Review the deliverables listed above to establish clear alignment before progressing to subsequent milestones.`;
      } else if (lower.includes("skill") || lower.includes("gap")) {
        coachReply = `For **${activeTopic.name}**, begin by auditing your current baseline competencies against verified industry expectations. You can check ATS keyword alignment in the Resume Analyzer when ready.`;
      } else if (lower.includes("salary") || lower.includes("negotiat") || lower.includes("comp")) {
        coachReply = `In **${activeTopic.name}**, start by evaluating your current responsibilities and verified market benchmarks before drafting negotiation talking points.`;
      } else if (lower.includes("linkedin") || lower.includes("profile") || lower.includes("brand")) {
        coachReply = `For **${activeTopic.name}**, your starting milestone is defining your unique value proposition before rewriting headlines or publishing case studies.`;
      } else {
        coachReply = `Strategic guidance for **${activeTopic.name}** on "${text}":\n\n1. Begin with **Step 01 (${activeTopic.roadmapSteps[0].title})** to build a solid baseline.\n2. Work through each milestone sequentially using the interactive checklist above.\n3. Validate your progress against target role benchmarks.`;
      }

      const assistantMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        role: "assistant",
        content: coachReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        topicId: selectedTopicId,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 500);
  };

  // Handle Attachment selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit.");
      return;
    }
    setAttachedFileName(file.name);
    toast.success(`Attached ${file.name} to coaching context`);
    e.target.value = "";
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Hidden File Input for Attachment */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.txt,.md,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <CareerCoachHeader
        activeTopicName={activeTopic.name}
        onOpenRoadmap={() => setIsRoadmapModalOpen(true)}
      />

      {/* Clean, Wide 2-Column Workspace (Left Topics 28%, Right Hero Workspace 72%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Coaching Topics (3.5 cols on desktop) */}
        <div className="lg:col-span-4 xl:col-span-3.5 h-[760px]">
          <CoachingTopicRail
            selectedTopicId={selectedTopicId}
            onSelectTopic={handleSelectTopic}
          />
        </div>

        {/* Right Column: Hero Career Coach Workspace (8.5 cols on desktop) */}
        <div className="lg:col-span-8 xl:col-span-8.5 flex flex-col h-[760px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Conversation & Hero Roadmap Area */}
          <CareerCoachConversation
            topicName={activeTopic.name}
            greetingText={activeTopic.greeting}
            suggestedPrompts={activeTopic.suggestedPrompts}
            roadmap={activeRoadmap}
            messages={messages}
            onSuggestionClick={(prompt) => handleSend(prompt)}
            onViewRoadmapDetails={() => setIsRoadmapModalOpen(true)}
          />

          {/* Integrated Composer with Topic Tools */}
          <CareerCoachComposer
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            isStreaming={isStreaming}
            quickTools={activeTopic.quickTools}
            onAttachFile={() => fileInputRef.current?.click()}
            attachedFileName={attachedFileName}
            onRemoveAttachment={() => setAttachedFileName(null)}
            onQuickPrompt={(prompt) => handleSend(prompt)}
          />
        </div>
      </div>

      {/* Roadmap Details Modal */}
      <RoadmapDetailsModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        roadmap={activeRoadmap}
      />
    </div>
  );
}
