"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import {
    MessageSquare,
    Send,
    RefreshCw,
    Sparkles,
    User,
    Bot,
    AlertCircle,
    Target,
    ChevronDown,
    ChevronUp,
    X,
    Info,
    TrendingUp,
    FileText,
    Code,
    Folder,
    Star,
    ChevronRight,
    Briefcase,
    Paperclip,
    Loader2
} from "lucide-react";
import { analyzeResume } from "@/lib/atsAnalyzer";
import { ChatMessage, trimConversationHistory, buildResumeContextBlock, hasResumeContent, buildATSContextBlock, ATSContextInput } from "@/lib/careerCoachService";

const STARTER_QUESTIONS = [
    { icon: TrendingUp, text: "How can I improve my ATS score?" },
    { icon: FileText, text: "What are the weakest parts of my resume?" },
    { icon: Code, text: "How can I improve my Java Developer resume?" },
    { icon: Folder, text: "Review my projects." },
    { icon: Target, text: "How can I tailor my resume for a job?" },
    { icon: Star, text: "What skills should I highlight?" }
];

const MAX_INPUT_LENGTH = 3800;

interface AttachedDoc {
    name: string;
    size: number;
    text: string;
}

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
    return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

const generateId = () => Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);

export default function CareerCoachPage() {
    const { user } = useAuth();
    const { resume } = useResume();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Document Attachment State
    const [attachedDoc, setAttachedDoc] = useState<AttachedDoc | null>(null);
    const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Job Description panel & Context Inspector state
    const [jobDescription, setJobDescription] = useState<string>("");
    const [jdPanelOpen, setJdPanelOpen] = useState<boolean>(false);
    const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const turnCount = Math.floor(messages.length / 2);

    // Memoize resume context block so it only rebuilds when resume changes
    const baseResumeContextString = useMemo(() => {
        return hasResumeContent(resume) ? buildResumeContextBlock(resume) : undefined;
    }, [resume]);

    // Combine base resume context with attached uploaded document (if any)
    const combinedResumeContextString = useMemo(() => {
        let ctx = baseResumeContextString || "";
        if (attachedDoc && attachedDoc.text) {
            const docBlock = `=== UPLOADED DOCUMENT ATTACHMENT: ${attachedDoc.name} ===\n(Candidate uploaded this file directly in chat. Answer questions referencing its contents.)\n\n${attachedDoc.text.substring(0, 3500)}\n=== END UPLOADED DOCUMENT ===`;
            ctx = ctx ? `${ctx}\n\n${docBlock}` : docBlock;
        }
        return ctx || undefined;
    }, [baseResumeContextString, attachedDoc]);

    // Memoize ATS Analysis computation
    const atsResult = useMemo(() => {
        return hasResumeContent(resume) ? analyzeResume(resume, false) : null;
    }, [resume]);

    // Memoize ATS context block string
    const atsContextString = useMemo(() => {
        return atsResult ? buildATSContextBlock(atsResult as ATSContextInput) : undefined;
    }, [atsResult]);

    // Trimmed active JD context string
    const cleanedJobDescription = useMemo(() => {
        return jobDescription.trim();
    }, [jobDescription]);

    // File Upload Handler (PDF, TXT, MD, DOCX, etc.)
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = "";

        if (file.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }

        setIsParsingDoc(true);
        setError(null);

        try {
            let extractedText = "";
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
                const formData = new FormData();
                formData.append("file", file);

                const idToken = await user?.getIdToken();
                const res = await fetch("/api/parse-pdf", {
                    method: "POST",
                    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
                    body: formData
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.error || "Could not extract text from the selected PDF.");
                }
                extractedText = data.extractedText || data.text || "";
            } else if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json") || fileName.endsWith(".csv") || fileName.endsWith(".log") || file.type.startsWith("text/")) {
                extractedText = await file.text();
            } else {
                const rawText = await file.text();
                extractedText = rawText.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, " ").replace(/\s+/g, " ").trim();
            }

            if (!extractedText || extractedText.trim().length < 10) {
                throw new Error("Could not extract text from the selected file. If this is a scanned PDF or binary file, please try uploading a text-based document or pasting the text directly.");
            }

            setAttachedDoc({
                name: file.name,
                size: file.size,
                text: extractedText.trim()
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to parse file.";
            setError(msg);
        } finally {
            setIsParsingDoc(false);
        }
    };

    // Auto-resize textarea logic up to 128px
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
        }
    }, [inputValue]);

    // Auto-scroll logic after DOM updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    const handleReset = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setMessages([]);
        setInputValue("");
        setAttachedDoc(null);
        setIsStreaming(false);
        setError(null);
    };

    const handleSend = async (textToSend?: string) => {
        const messageContent = (textToSend || inputValue).trim();
        if (!messageContent || isStreaming) return;

        setError(null);
        if (!textToSend) {
            setInputValue("");
        }

        const userMessage: ChatMessage = {
            id: generateId(),
            role: "user",
            content: messageContent
        };

        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: ""
        };

        const nextMessages = [...messages, userMessage];
        setMessages([...nextMessages, assistantMessage]);

        const trimmedHistory = trimConversationHistory(nextMessages, 8);

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsStreaming(true);

        try {
            const idToken = await user?.getIdToken();

            const res = await fetch("/api/career-coach", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
                },
                body: JSON.stringify({
                    messages: trimmedHistory,
                    resumeContext: combinedResumeContextString,
                    atsContext: atsContextString,
                    jobDescription: cleanedJobDescription.length >= 20 ? cleanedJobDescription : undefined
                }),
                signal: controller.signal
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${res.status}`);
            }

            if (!res.body) {
                throw new Error("No response body received from stream.");
            }

            const reader = res.body.getReader();
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
        <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                <div className="flex items-center gap-3.5">
                    {/* Header Icon Badge */}
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                        <MessageSquare className="w-5.5 h-5.5" />
                        <Sparkles className="w-3.5 h-3.5 absolute top-1 right-1 text-blue-200" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            HireLens Career Coach
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                Beta
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Powered by your resume & HireLens ATS intelligence
                        </p>
                    </div>
                </div>

                {messages.length > 0 && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        New conversation
                    </button>
                )}
            </div>

            {/* Context Status Bar */}
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    {hasResumeContent(resume) || attachedDoc ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Context active</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate max-w-xs">{attachedDoc ? `Doc: ${attachedDoc.name}` : (resume.personalInfo.fullName || resume.title || "Resume Profile")}</span>
                            {atsResult && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
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
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                            <Link href="/dashboard/builder" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Add details
                            </Link>
                            <span>or attach a document below.</span>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setInspectorOpen(!inspectorOpen)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex-shrink-0 bg-white dark:bg-slate-800 shadow-2xs"
                >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Context</span>
                </button>
            </div>

            {/* Context Inspector Panel */}
            {inspectorOpen && (
                <div className="p-3.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300 flex-shrink-0">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        Active Context Inspector
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>• Resume Context: <span className="font-medium">{hasResumeContent(resume) ? "Active" : "None"}</span></div>
                        <div>• Attached Document: <span className="font-medium">{attachedDoc ? `${attachedDoc.name} (${(attachedDoc.size / 1024).toFixed(1)} KB)` : "None"}</span></div>
                        <div>• ATS Intelligence: <span className="font-medium">{atsResult ? `${Math.round(atsResult.overallScore)}/100 (HireLens ATS Engine)` : "None"}</span></div>
                        <div>• Job Description: <span className="font-medium">{cleanedJobDescription.length >= 20 ? `Active (${cleanedJobDescription.length} chars)` : "None"}</span></div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
                        Note: ATS scores are computed by the deterministic HireLens ATS Engine, not generated or recalculated by AI.
                    </p>
                </div>
            )}

            {/* Optional Job Description Panel */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex-shrink-0">
                <button
                    type="button"
                    onClick={() => setJdPanelOpen(!jdPanelOpen)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                    {jdPanelOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {jdPanelOpen && (
                    <div className="p-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 bg-white dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Paste a job description to get role-specific advice. The Coach will only reference skills already in your resume.
                        </p>
                        <textarea
                            rows={3}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                            placeholder="Paste Target Job Description here..."
                            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all custom-scrollbar max-h-48"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                            <span>{jobDescription.length}/5000 characters</span>
                            {jobDescription.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setJobDescription("")}
                                    className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Conversation Length Warning Banner (>= 6 turns) */}
            {turnCount >= 6 && (
                <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-4 sm:py-8 px-4 space-y-6 max-w-2xl mx-auto">
                        {/* Welcome Hero Illustration Badge */}
                        <div className="relative mb-1 flex items-center justify-center">
                            <div className="relative flex items-center justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div className="absolute -bottom-1 -right-2 w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                                    <Sparkles className="w-4 h-4 text-blue-200" />
                                </div>
                                <Sparkles className="absolute -top-2 -left-3 w-5 h-5 text-indigo-400 animate-pulse" />
                                <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-blue-400" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Welcome to HireLens Career Coach
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                                Ask questions about your resume strategy, ATS scores, role compatibility, or career growth. The Coach interprets your candidate data to provide targeted, actionable guidance.
                            </p>
                        </div>

                        {/* Starter Questions Divider */}
                        <div className="w-full relative my-3 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
                            </div>
                            <div className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Suggested starter questions
                            </div>
                        </div>

                        {/* Starter Questions Grid (2 columns, 3 rows matching design reference) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            {STARTER_QUESTIONS.map((q, idx) => {
                                const IconComponent = q.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(q.text)}
                                        className="p-3.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700/80 rounded-2xl transition-all duration-200 text-left flex items-center justify-between group shadow-2xs hover:shadow-md hover:shadow-blue-500/5"
                                    >
                                        <div className="flex items-center gap-3 pr-2 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{q.text}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                    </button>
                                );
                            })}
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
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 shadow-2xs whitespace-pre-wrap"
                                        }`}
                                    >
                                        {msg.content ? (
                                            msg.content
                                        ) : (
                                            <div className="flex items-center gap-1.5 py-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-4 mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 flex-shrink-0">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 space-y-2">
                {/* Document Parsing Spinner */}
                {isParsingDoc && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing attached document...</span>
                    </div>
                )}

                {/* Attached Document Chip */}
                {attachedDoc && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-xs text-blue-700 dark:text-blue-300 w-fit">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="font-semibold truncate max-w-xs">{attachedDoc.name}</span>
                        <span className="text-[10px] text-blue-400">({(attachedDoc.size / 1024).toFixed(1)} KB)</span>
                        <button
                            type="button"
                            onClick={() => setAttachedDoc(null)}
                            className="ml-1 text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2.5 items-end"
                >
                    {/* Relative Input Wrapper containing Paperclip icon inside on left */}
                    <div className="relative flex-1 flex items-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach document (PDF, TXT, MD)"
                            className="absolute left-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 z-10"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            style={{ minHeight: "48px" }}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                            onKeyDown={handleKeyDown}
                            placeholder={attachedDoc ? `Ask a question about ${attachedDoc.name}...` : "Ask HireLens Career Coach a question..."}
                            className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all custom-scrollbar overflow-y-auto"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isStreaming}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>

                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                    The Coach uses your HireLens resume and ATS analysis as context. Responses are AI-generated coaching, not verified recruiter assessments.
                </p>

                {inputValue.length > 2000 && (
                    <p className={`text-[10px] text-center font-medium ${inputValue.length > 3500 ? "text-red-500 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                        {inputValue.length} / {MAX_INPUT_LENGTH} characters
                    </p>
                )}
            </div>
        </div>
    );
}
