"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Loader2, Sparkles, Paperclip, FileText, X, Check, FileCheck } from "lucide-react";
import QuickActions from "./QuickActions";
import { AttachmentContext, AgentAttachment } from "@/types/agent";
import { useAuth } from "@/contexts/AuthContext";

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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-blue-600/20">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            AI Career Agent
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                                Multi-Agent System
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Orchestrating resume, ATS, job search & interview prep
                        </p>
                    </div>
                </div>
            </div>

            {/* Conversation Session Active Attachment Context Bar */}
            {sessionAttachments && sessionAttachments.length > 0 && (
                <div className="px-6 py-2 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="font-semibold text-blue-900 dark:text-blue-300 text-[11px] shrink-0 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Active Session Context:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {sessionAttachments.map((att) => (
                            <div
                                key={att.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium shrink-0 shadow-2xs"
                            >
                                <span className="truncate max-w-[120px]">{att.name}</span>
                                {onRemoveSessionAttachment && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveSessionAttachment(att.id)}
                                        className="hover:text-red-500 transition-colors p-0.5"
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

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                            How can I help you today?
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                            Ask a question, upload a career document (PDF, DOCX, TXT), or select a quick action below.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === "user";
                        return (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                        isUser
                                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                            : "bg-blue-600 text-white"
                                    }`}
                                >
                                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
                                    <div
                                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                                            isUser
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : msg.error
                                                ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-tl-none"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                                        }`}
                                    >
                                        {msg.text ? (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        ) : msg.isStreaming ? (
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Thinking & processing request...</span>
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

            {/* Error & Upload Error Alert */}
            {(error || uploadError) && (
                <div className="px-6 py-2 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-800 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadError || error}</span>
                    </div>
                    <button
                        onClick={() => setUploadError(null)}
                        className="p-1 hover:text-red-800 dark:hover:text-red-200"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Quick Actions Footer Bar */}
            <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800">
                <QuickActions onSelectAction={onSelectQuickAction} disabled={isStreaming} />
            </div>

            {/* Input Form & Attachment Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {/* File Attachment Upload Chips */}
                {attachments.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {attachments.map((att) => (
                            <div
                                key={att.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium shrink-0"
                            >
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                <span className="truncate max-w-[140px]">{att.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(att.id)}
                                    className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors text-blue-600 dark:text-blue-300"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.docx,.doc,.txt,.md"
                        className="hidden"
                    />

                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask AI Agent or attach document (e.g. 'Build an ATS optimized resume from this reference')..."
                            disabled={isStreaming}
                            rows={2}
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs leading-relaxed placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none disabled:opacity-50"
                        />

                        <button
                            type="button"
                            onClick={handleAttachButtonClick}
                            disabled={isStreaming || isUploading}
                            title="Attach career document (PDF, DOCX, TXT)"
                            className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                                <Paperclip className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isStreaming || isUploading || (!input.trim() && attachments.length === 0)}
                        className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                        {isStreaming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
