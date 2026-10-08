"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Loader2, Sparkles, Paperclip, FileText, X, FileCheck, Cpu } from "lucide-react";
import QuickActions from "./QuickActions";
import { AttachmentContext, AgentAttachment } from "@/types/agent";
import { useAuth } from "@/contexts/AuthContext";
import ScriptAccent from "@/components/common/ScriptAccent";
import { cn } from "@/lib/utils";

export interface Message {
    id: string;
    sender: "user" | "assistant";
    text: string;
    agent?: string;
    timestamp: Date;
    isStreaming?: boolean;
    error?: boolean;
    attachments?: AttachmentContext[];
}

interface ConversationPaneProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    onSendMessage: (text: string, attachments?: AttachmentContext[]) => void;
    isStreaming: boolean;
    error?: string | null;
    onSelectQuickAction: (prompt: string) => void;
    sessionAttachments?: AgentAttachment[];
    onRemoveSessionAttachment?: (id: string) => void;
}

export default function ConversationPane({
    messages,
    input,
    setInput,
    onSendMessage,
    isStreaming,
    error = null,
    onSelectQuickAction,
    sessionAttachments = [],
    onRemoveSessionAttachment,
}: ConversationPaneProps) {
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [attachments, setAttachments] = useState<AttachmentContext[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if ((input.trim() || attachments.length > 0) && !isStreaming && !isUploading) {
                onSendMessage(input, attachments);
                setAttachments([]);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((input.trim() || attachments.length > 0) && !isStreaming && !isUploading) {
            onSendMessage(input, attachments);
            setAttachments([]);
        }
    };

    const handleAttachButtonClick = () => {
        setUploadError(null);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const idToken = await user?.getIdToken();
            if (!idToken) {
                throw new Error("Authentication session expired. Please refresh and try again.");
            }

            const newAttachments: AttachmentContext[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File '${file.name}' exceeds the 5MB size limit.`);
                }

                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/parse-pdf", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Failed to parse '${file.name}'.`);
                }

                const data = await response.json();
                newAttachments.push({
                    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    name: data.filename || file.name,
                    mimeType: data.mimeType || file.type,
                    extractedText: data.extractedText || "",
                    size: data.size || file.size,
                });
            }

            setAttachments((prev) => [...prev, ...newAttachments]);
        } catch (err: any) {
            console.error("Attachment upload error:", err);
            setUploadError(err.message || "Failed to upload document.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const getUserInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="h-full flex flex-col bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Conversation Header matching PDF Page 10 */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 gap-4 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shadow-indigo-500/20 ring-1 ring-indigo-500/30 shrink-0">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2.5 flex-nowrap min-w-0">
                        <h2 className="text-[21px] sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-tight">
                            <span>AI Career </span>
                            <span className="text-indigo-600 dark:text-indigo-400">Agent</span>
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                            Multi-Agent System
                        </span>
                    </div>
                </div>

                {/* Header Right: Script Accent */}
                <div className="hidden xl:flex items-center shrink-0 pl-3">
                    <ScriptAccent
                        text="Same You. Bigger Opportunities."
                        className="text-xs origin-right text-indigo-600/70 dark:text-indigo-300/70 whitespace-nowrap"
                    />
                </div>
            </div>

            {/* Suggested Action Cards (Directly below Header per Reference) */}
            <QuickActions onSelectAction={onSelectQuickAction} disabled={isStreaming} />

            {/* Conversation Session Active Attachment Context Bar */}
            {sessionAttachments && sessionAttachments.length > 0 && (
                <div className="px-5 py-2 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 text-[11px] shrink-0 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Session Context:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {sessionAttachments.map((att) => (
                            <div
                                key={att.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium shrink-0 shadow-2xs"
                            >
                                <span className="truncate max-w-[140px]">{att.name}</span>
                                {onRemoveSessionAttachment && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveSessionAttachment(att.id)}
                                        className="hover:text-rose-500 transition-colors p-0.5 ml-0.5"
                                        title="Remove document from context"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                            How can I help advance your career today?
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                            Ask a question, upload your resume or job description, or pick a Quick Action below.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === "user";
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex items-start gap-3",
                                    isUser ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs",
                                        isUser
                                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                            : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white"
                                    )}
                                >
                                    {isUser ? (
                                        <span>{getUserInitials(user?.displayName)}</span>
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>

                                <div className={cn("flex flex-col max-w-[84%]", isUser ? "items-end" : "items-start")}>
                                    <div
                                        className={cn(
                                            "p-4 rounded-2xl text-xs leading-relaxed shadow-2xs",
                                            isUser
                                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs"
                                                : msg.error
                                                ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-tl-xs"
                                                : "bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                                        )}
                                    >
                                        {msg.text ? (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        ) : msg.isStreaming ? (
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                                <span>Thinking and orchestrating agents...</span>
                                            </div>
                                        ) : null}

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-slate-700 space-y-1">
                                                {msg.attachments.map((att) => (
                                                    <div
                                                        key={att.id}
                                                        className="flex items-center gap-1.5 text-[11px] opacity-90"
                                                    >
                                                        <Paperclip className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{att.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Error Alert */}
            {(error || uploadError) && (
                <div className="px-5 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadError || error}</span>
                    </div>
                    <button
                        onClick={() => setUploadError(null)}
                        className="p-1 hover:text-rose-800 dark:hover:text-rose-200"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Composer & Attachment Form */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {/* File Attachment Upload Chips */}
                {attachments.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {attachments.map((att) => (
                            <div
                                key={att.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0"
                            >
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="truncate max-w-[160px]">{att.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(att.id)}
                                    className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors text-indigo-600 dark:text-indigo-300 ml-1"
                                    aria-label="Remove attachment"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="flex items-center gap-2.5 w-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.docx,.doc,.txt,.md"
                        className="hidden"
                    />

                    <div className="relative flex-1 min-w-0 flex items-center bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-transparent transition-all shadow-2xs h-12">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask AI Agent or attach document (e.g. 'Analyze my ATS score')..."
                            disabled={isStreaming}
                            className="w-full pl-4 pr-11 bg-transparent text-slate-900 dark:text-white text-sm leading-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden disabled:opacity-50 h-full box-border truncate"
                        />

                        <button
                            type="button"
                            onClick={handleAttachButtonClick}
                            disabled={isStreaming || isUploading}
                            title="Attach career document (PDF, DOCX, TXT)"
                            aria-label="Attach document"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                        >
                            {isUploading ? (
                                <Loader2 className="w-[18px] h-[18px] animate-spin text-indigo-600" />
                            ) : (
                                <Paperclip className="w-[18px] h-[18px]" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isStreaming || isUploading || (!input.trim() && attachments.length === 0)}
                        aria-label="Send message"
                        className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold disabled:opacity-40 transition-all shadow-xs hover:shadow-md flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isStreaming ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 translate-x-[0.5px]" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
