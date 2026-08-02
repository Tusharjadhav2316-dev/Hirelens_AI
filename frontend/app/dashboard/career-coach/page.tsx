"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import { MessageSquare, Send, RefreshCw, Sparkles, User, Bot, AlertCircle, Target, ChevronDown, ChevronUp, X, Info } from "lucide-react";
import { analyzeResume } from "@/lib/atsAnalyzer";
import { ChatMessage, trimConversationHistory, buildResumeContextBlock, hasResumeContent, buildATSContextBlock, ATSContextInput } from "@/lib/careerCoachService";

const STARTER_PROMPTS = [
    "How can I improve my ATS score?",
    "What are the weakest parts of my resume?",
    "How can I improve my Java Developer resume?",
    "Review my projects.",
    "How can I tailor my resume for a job?",
    "What skills should I highlight?"
];

const MAX_INPUT_LENGTH = 3800;

function mapErrorToUserMessage(err: unknown): string {
    const raw = err instanceof Error ? err.message.toLowerCase() : "";
    if (raw.includes("rate limit") || raw.includes("429")) {
        return "HireLens Career Coach is receiving a lot of requests right now. Please wait a moment and try again.";
    }
    if (raw.includes("sign in") || raw.includes("unauthorized") || raw.includes("401")) {
        return "Your session has expired. Please refresh the page and sign in again.";
    }
    if (raw.includes("connect") || raw.includes("network") || raw.includes("502") || raw.includes("fetch failed")) {
        return "Couldn't reach the Career Coach service. Please check your connection and try again.";
    }
    if (raw.includes("4000") || raw.includes("too long") || raw.includes("character")) {
        return "Your message is too long. Please shorten it and try again.";
    }
    return "Something went wrong. Please try again.";
}

const generateId = () => Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);

export default function CareerCoachPage() {
    const { user } = useAuth();
    const { resume } = useResume();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Job Description panel & Context Inspector state
    const [jobDescription, setJobDescription] = useState<string>("");
    const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);
    const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const turnCount = Math.floor(messages.length / 2);

    // Single normalized Job Description string for validation, UI checks, and API payload
    const cleanedJobDescription = useMemo(() => jobDescription.trim(), [jobDescription]);

    // Memoize resume context block so it is only rebuilt when resume state changes
    const resumeContextString = useMemo(() => {
        return hasResumeContent(resume) ? buildResumeContextBlock(resume) : undefined;
    }, [resume]);

    // Compute deterministic ATS analysis result recomputing only when resume changes
    const atsResult = useMemo(() => {
        return hasResumeContent(resume) ? analyzeResume(resume, false) : null;
    }, [resume]);

    // Memoize ATS context block rebuilding only when ATS result changes
    const atsContextString = useMemo(() => {
        return atsResult ? buildATSContextBlock(atsResult as ATSContextInput) : undefined;
    }, [atsResult]);

    // Auto-scroll to bottom after DOM updates whenever messages or streaming state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    // Auto-resize textarea to fit content (max 128px)
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
        }
    }, [inputValue]);

    // Abort in-flight requests on component unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleReset = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setMessages([]);
        setInputValue("");
        setError(null);
        setIsStreaming(false);
    };

    const handleSend = async (text?: string) => {
        const content = (text ?? inputValue).trim();
        if (!content || isStreaming) return;

        setInputValue("");
        setError(null);

        const userMessage: ChatMessage = {
            id: generateId(),
            role: "user",
            content
        };

        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: ""
        };

        let updatedMessages: ChatMessage[] = [];
        setMessages(prev => {
            updatedMessages = [...prev, userMessage];
            return [...updatedMessages, assistantMessage];
        });
        setIsStreaming(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const token = await user?.getIdToken();
            if (!token) throw new Error("You must be signed in to use Career Coach.");

            const trimmedHistory = trimConversationHistory(updatedMessages, 8);

            const response = await fetch("/api/career-coach", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: trimmedHistory,
                    ...(resumeContextString ? { resumeContext: resumeContextString } : {}),
                    ...(atsContextString ? { atsContext: atsContextString } : {}),
                    ...(cleanedJobDescription.length >= 20 ? { jobDescription: cleanedJobDescription } : {})
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    throw new Error("Rate limit reached. Please wait a moment and try again.");
                }
                throw new Error(errData?.error ?? `Request failed (${response.status})`);
            }

            if (!response.body) throw new Error("No response stream received.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;
                setMessages(prev =>
                    prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: accumulated } : msg)
                );
            }

            const finalChunk = decoder.decode();
            if (finalChunk) {
                accumulated += finalChunk;
                setMessages(prev =>
                    prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: accumulated } : msg)
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            setError(mapErrorToUserMessage(err));
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-3 sm:px-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            HireLens Career Coach
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Beta
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Powered by your resume & HireLens ATS intelligence
                        </p>
                    </div>
                </div>

                {messages.length > 0 && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        New conversation
                    </button>
                )}
            </div>

            {/* Context Status Bar */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    {hasResumeContent(resume) ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resume context active</span>
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span className="truncate max-w-xs">{resume.personalInfo.fullName || resume.title || "Resume Profile"}</span>
                            {atsResult && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        ATS Score: {Math.round(atsResult.overallScore)}/100 (HireLens ATS Engine)
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                            <span className="font-semibold text-amber-700 dark:text-amber-400">No resume loaded</span>
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                            <Link href="/dashboard/builder" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Add resume details
                            </Link>
                            <span>for personalized coaching.</span>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setInspectorOpen(!inspectorOpen)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-0.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors flex-shrink-0"
                >
                    <Info className="w-3.5 h-3.5" />
                    <span>Context</span>
                </button>
            </div>

            {/* Context Inspector Panel */}
            {inspectorOpen && (
                <div className="p-3 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        Active Context Inspector
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <div>• Resume Context: <span className="font-medium">{hasResumeContent(resume) ? "Active" : "None"}</span></div>
                        <div>• ATS Intelligence: <span className="font-medium">{atsResult ? `${Math.round(atsResult.overallScore)}/100 (HireLens ATS Engine)` : "None"}</span></div>
                        <div>• Job Description: <span className="font-medium">{cleanedJobDescription.length >= 20 ? `Active (${cleanedJobDescription.length} chars)` : "None"}</span></div>
                        <div>• Conversation History: <span className="font-medium">{turnCount} / 8 context turns ({messages.length} messages)</span></div>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic border-t border-slate-200/60 dark:border-slate-700/60 pt-1">
                        Note: ATS scores are computed by the deterministic HireLens ATS Engine, not generated or recalculated by AI.
                    </p>
                </div>
            )}

            {/* Optional Job Description Panel */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <button
                    type="button"
                    onClick={() => setJdPanelOpen(!jdPanelOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                            {cleanedJobDescription.length >= 20 ? (
                                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                    Job Description Active ✓
                                </span>
                            ) : (
                                "Add a Job Description for role-specific coaching (optional)"
                            )}
                        </span>
                    </div>
                    {jdPanelOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>

                {jdPanelOpen && (
                    <div className="p-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 bg-white dark:bg-slate-900">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Paste a job description to get role-specific advice. The Coach will only reference skills already in your resume.
                        </p>
                        <textarea
                            rows={3}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                            placeholder="Paste Target Job Description here..."
                            className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all custom-scrollbar max-h-48"
                        />
                        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                            <span>{jobDescription.length}/5000 characters</span>
                            {jobDescription.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setJobDescription("")}
                                    className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Conversation Length Warning Banner (>= 6 turns) */}
            {turnCount >= 6 && (
                <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                    <span>
                        Earlier messages may fall outside the coaching context window.{" "}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200"
                        >
                            Start a new conversation
                        </button>{" "}
                        if the Coach seems to lose context.
                    </span>
                </div>
            )}

            {/* Scrollable Messages / Empty State */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                            <Sparkles className="w-8 h-8" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome to HireLens Career Coach
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Ask questions about your resume strategy, ATS scores, role compatibility, or career growth. The Coach interprets your candidate data to provide targeted, actionable guidance.
                            </p>
                        </div>

                        {/* Starter Prompts */}
                        <div className="w-full space-y-3 text-left">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">
                                Suggested Starter Questions
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {STARTER_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(prompt)}
                                        className="p-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-xl transition-all duration-200 text-left flex items-start gap-2 group shadow-2xs"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <span>{prompt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isUser = msg.role === "user";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium text-xs shadow-xs ${
                                            isUser
                                                ? "bg-blue-600"
                                                : "bg-slate-700 dark:bg-slate-700"
                                        }`}
                                    >
                                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                            isUser
                                                ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                                                : "bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 shadow-2xs whitespace-pre-wrap"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Streaming / Thinking Indicator */}
                        {isStreaming && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-4 mb-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2 items-end"
                >
                    <textarea
                        ref={textareaRef}
                        style={{ minHeight: "44px" }}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask HireLens Career Coach a question..."
                        className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all custom-scrollbar overflow-y-auto"
                    />

                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isStreaming}
                        className="h-11 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>

                <p className="mt-2 text-[11px] text-center text-gray-400 dark:text-gray-500">
                    The Coach uses your HireLens resume and ATS analysis as context. Responses are AI-generated coaching, not verified recruiter assessments.
                </p>

                {inputValue.length > 2000 && (
                    <p className={`mt-1 text-[10px] text-center font-medium ${inputValue.length > 3500 ? "text-red-500 font-semibold" : "text-gray-400 dark:text-gray-500"}`}>
                        {inputValue.length} / {MAX_INPUT_LENGTH} characters
                    </p>
                )}
            </div>
        </div>
    );
}
