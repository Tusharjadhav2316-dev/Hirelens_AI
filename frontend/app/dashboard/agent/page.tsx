"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import ConversationPane, { Message } from "@/components/agent/ConversationPane";
import ArtifactCanvas from "@/components/agent/ArtifactCanvas";
import { TraceStep, updateTraceFromEvent } from "@/components/agent/AgentActivityTrace";
import { streamAgentEvents, AgentEvent } from "@/lib/agentStreamClient";
import { Artifact, AgentAttachment, AttachmentCategory, InterviewSessionState } from "@/types/agent";
import InterviewSetup, { InterviewConfig } from "@/components/agent/InterviewSetup";
import { MessageSquare, Layers } from "lucide-react";

export default function AgentWorkspacePage() {
    const { user } = useAuth();
    const { resume } = useResume();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [streamContent, setStreamContent] = useState<string>("");
    const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"chat" | "canvas">("chat");

    // Interview Session State
    const [interviewSession, setInterviewSession] = useState<InterviewSessionState | null>(null);
    const [showInterviewSetup, setShowInterviewSetup] = useState<boolean>(false);

    // Conversation-Scoped Persistent Attachments
    const [sessionAttachments, setSessionAttachments] = useState<AgentAttachment[]>([]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastUserPromptRef = useRef<string>("");

    // Cleanup in-flight stream on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const classifyAttachment = (filename: string): AttachmentCategory => {
        const lower = filename.toLowerCase();
        if (lower.includes("job") || lower.includes("jd") || lower.includes("description") || lower.includes("requirement")) {
            return "job_description";
        }
        if (lower.includes("cover") || lower.includes("letter")) {
            return "cover_letter";
        }
        if (lower.includes("resume") || lower.includes("cv") || lower.includes("bio")) {
            return "resume";
        }
        return "document";
    };

    // Quick action handler: pre-fills input or opens interview setup
    const handleSelectQuickAction = useCallback((prompt: string) => {
        if (prompt.toLowerCase().includes("interview") || prompt.toLowerCase().includes("mock")) {
            setShowInterviewSetup(true);
            setActiveTab("canvas");
        } else {
            setInput(prompt);
        }
    }, []);

    const handleStartInterview = (config: InterviewConfig) => {
        setShowInterviewSetup(false);
        const startMsg = `Start a ${config.interviewType} mock interview for the ${config.targetRole} role with starting difficulty ${config.difficulty}`;
        handleSendMessage(startMsg);
    };

    const handleCancelInterview = () => {
        setInterviewSession(null);
        setShowInterviewSetup(false);
        setMessages((prev) => [
            ...prev,
            {
                id: `msg-cancel-${Date.now()}`,
                sender: "assistant",
                text: "Mock interview session cancelled. You can start a new interview anytime using the Quick Actions.",
                timestamp: new Date(),
            },
        ]);
    };

    // Core stream handler with conversation-scoped attachments
    const handleSendMessage = async (textToSend: string, newAttachments: any[] = []) => {
        const prompt = textToSend.trim();

        // Register any newly uploaded attachments into conversation session context
        let updatedSession = [...sessionAttachments];
        if (newAttachments && newAttachments.length > 0) {
            const formatted: AgentAttachment[] = newAttachments.map((att) => ({
                id: att.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: att.name,
                mimeType: att.mimeType || "application/pdf",
                category: att.category || classifyAttachment(att.name),
                text: att.extractedText || att.text || "",
                extractedText: att.extractedText || att.text || "",
                size: att.size || 0,
                uploadedAt: Date.now(),
            }));

            // Filter duplicates by name or id
            const existingIds = new Set(updatedSession.map((a) => a.id));
            const fresh = formatted.filter((f) => !existingIds.has(f.id));
            updatedSession = [...updatedSession, ...fresh];
            setSessionAttachments(updatedSession);
        }

        if ((!prompt && updatedSession.length === 0) || isStreaming) return;

        lastUserPromptRef.current = prompt || "Uploaded document analysis";

        // Abort any existing stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const userMsg: Message = {
            id: `msg-user-${Date.now()}`,
            sender: "user",
            text: prompt || "Attached document for analysis.",
            timestamp: new Date(),
            attachments: newAttachments.length > 0 ? newAttachments : undefined,
        };

        const assistantMsgId = `msg-assistant-${Date.now()}`;
        const assistantMsg: Message = {
            id: assistantMsgId,
            sender: "assistant",
            text: "",
            timestamp: new Date(),
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        setIsStreaming(true);
        setError(null);
        setStreamContent("");
        setTraceSteps([]);

        try {
            const idToken = await user?.getIdToken();
            if (!idToken) {
                throw new Error("Authentication session invalid. Please refresh and log in again.");
            }

            // Map all session attachments with extractedText to backend context contract
            const payloadAttachments = updatedSession.map((att) => ({
                id: att.id,
                name: att.name,
                mimeType: att.mimeType,
                extractedText: att.extractedText || att.text || "",
                category: att.category,
                size: att.size || 0,
            }));

            const response = await fetch("/api/agent/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map((m) => ({
                        role: m.sender === "user" ? "user" : "assistant",
                        content: m.text,
                    })),
                    resume: resume || {},
                    attachments: payloadAttachments,
                    interview_session: interviewSession,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                let errText = "Agent service error";
                try {
                    const errJson = await response.json();
                    errText = errJson.error || errText;
                } catch (_) {}
                throw new Error(`[${response.status}] ${errText}`);
            }

            let accumulatedText = "";
            let currentSteps: TraceStep[] = [];

            for await (const event of streamAgentEvents(response)) {
                if (controller.signal.aborted) break;

                currentSteps = updateTraceFromEvent(currentSteps, event);
                setTraceSteps([...currentSteps]);

                if (event.type === "message_delta" && event.text) {
                    accumulatedText += event.text;
                    setStreamContent(accumulatedText);

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMsgId ? { ...m, text: accumulatedText } : m
                        )
                    );
                } else if (event.type === "artifact" && (event as any).artifact) {
                    const newArtifact = (event as any).artifact as Artifact;
                    setArtifacts((prev) => [...prev, newArtifact]);

                    // Persist or update active interview session state across turns
                    if (newArtifact.data && (newArtifact.data as any).session) {
                        setInterviewSession((newArtifact.data as any).session);
                    }
                    if (newArtifact.type === "interview_report_card") {
                        setInterviewSession(null);
                    }
                    setActiveTab("canvas");
                } else if (event.type === "error") {
                    setError(event.message);
                }
            }

            // Finalize message streaming state
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                )
            );
        } catch (err: any) {
            if (err.name === "AbortError") {
                console.log("In-flight agent stream aborted.");
                return;
            }

            const errorMsg = err.message || "Failed to communicate with Agent Service.";
            console.error("Agent Workspace Stream Error:", err);

            setError(errorMsg);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId
                        ? {
                              ...m,
                              text: m.text || "An error occurred while executing the request.",
                              isStreaming: false,
                              error: true,
                          }
                        : m
                )
            );
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    };

    const handleRemoveSessionAttachment = (id: string) => {
        setSessionAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const handleRetry = () => {
        if (lastUserPromptRef.current) {
            handleSendMessage(lastUserPromptRef.current);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 overflow-hidden">
            {/* Desktop 2-Column Layout / Mobile Tabs */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
                {/* Mobile Tab Controls */}
                <div className="flex md:hidden items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-2 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                            activeTab === "chat"
                                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Agent Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("canvas")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all relative ${
                            activeTab === "canvas"
                                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                                : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Artifact Canvas
                        {artifacts.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Left Pane: Conversation Interface */}
                <div
                    className={`flex-1 min-h-0 min-w-0 ${
                        activeTab === "chat" ? "block" : "hidden md:block"
                    }`}
                >
                    <ConversationPane
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSendMessage={handleSendMessage}
                        isStreaming={isStreaming}
                        error={error}
                        onSelectQuickAction={handleSelectQuickAction}
                        sessionAttachments={sessionAttachments}
                        onRemoveSessionAttachment={handleRemoveSessionAttachment}
                    />
                </div>

                {/* Right Pane: Generative UI Artifact Canvas */}
                <div
                    className={`flex-1 min-h-0 min-w-0 ${
                        activeTab === "canvas" ? "block" : "hidden md:block"
                    }`}
                >
                    <ArtifactCanvas
                        traceSteps={traceSteps}
                        isStreaming={isStreaming}
                        streamContent={streamContent}
                        artifacts={artifacts}
                        error={error}
                        onRetry={handleRetry}
                        onImproveResume={() => handleSendMessage("Improve my summary to boost ATS score")}
                        onSubmitInterviewAnswer={(ans) => handleSendMessage(ans)}
                        onCancelInterview={handleCancelInterview}
                        isSubmittingAnswer={isStreaming}
                        showInterviewSetup={showInterviewSetup}
                        onStartInterview={handleStartInterview}
                        onCancelInterviewSetup={() => setShowInterviewSetup(false)}
                    />
                </div>
            </div>
        </div>
    );
}
