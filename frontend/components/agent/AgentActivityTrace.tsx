"use client";

import React from "react";
import { CheckCircle2, Loader2, AlertCircle, Circle, Bot, Cpu } from "lucide-react";
import { AgentEvent } from "@/lib/agentStreamClient";

export interface TraceStep {
    id: string;
    agent: string;
    label: string;
    status: "pending" | "active" | "completed" | "error";
    tool?: string;
    timestamp?: number;
}

const AGENT_DISPLAY_NAMES: Record<string, string> = {
    manager: "Manager Agent",
    resume_agent: "Resume Agent",
    ats_agent: "ATS Agent",
    job_search_agent: "Job Search Agent",
    optimizer_agent: "Optimizer Agent",
    interview_coach_agent: "Interview Coach Agent",
    career_agent: "Career Agent",
};

export function getAgentDisplayName(agent: string): string {
    return AGENT_DISPLAY_NAMES[agent] || (agent ? agent.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Agent");
}

export function updateTraceFromEvent(currentSteps: TraceStep[], event: AgentEvent): TraceStep[] {
    const steps = [...currentSteps];
    const now = Date.now();

    switch (event.type) {
        case "agent_started": {
            const agent = event.agent || "manager";
            const existingIdx = steps.findIndex(s => s.agent === agent);
            const newStep: TraceStep = {
                id: `step-${agent}`,
                agent,
                label: `${getAgentDisplayName(agent)} — Understanding request`,
                status: "active",
                timestamp: now,
            };
            if (existingIdx >= 0) {
                steps[existingIdx] = newStep;
            } else {
                steps.push(newStep);
            }
            break;
        }

        case "tool_started": {
            const agent = event.agent || "manager";
            const existingIdx = steps.findIndex(s => s.agent === agent);
            const toolLabel = `${getAgentDisplayName(agent)} — Executing ${event.tool}`;
            if (existingIdx >= 0) {
                steps[existingIdx] = {
                    ...steps[existingIdx],
                    status: "active",
                    tool: event.tool,
                    label: toolLabel,
                };
            } else {
                steps.push({
                    id: `step-${agent}`,
                    agent,
                    label: toolLabel,
                    status: "active",
                    tool: event.tool,
                    timestamp: now,
                });
            }
            break;
        }

        case "tool_completed": {
            const agent = event.agent || "manager";
            const existingIdx = steps.findIndex(s => s.agent === agent);
            if (existingIdx >= 0) {
                steps[existingIdx] = {
                    ...steps[existingIdx],
                    tool: undefined,
                    label: `${getAgentDisplayName(agent)} — Completed step`,
                };
            }
            break;
        }

        case "agent_completed": {
            const agent = event.agent || "manager";
            const existingIdx = steps.findIndex(s => s.agent === agent);
            if (existingIdx >= 0) {
                steps[existingIdx] = {
                    ...steps[existingIdx],
                    status: "completed",
                    tool: undefined,
                    label: `${getAgentDisplayName(agent)} — Work complete`,
                };
            } else {
                steps.push({
                    id: `step-${agent}`,
                    agent,
                    label: `${getAgentDisplayName(agent)} — Work complete`,
                    status: "completed",
                    timestamp: now,
                });
            }
            break;
        }

        case "error": {
            // Mark any active step as error or add an error step
            const activeIdx = steps.findIndex(s => s.status === "active");
            if (activeIdx >= 0) {
                steps[activeIdx] = {
                    ...steps[activeIdx],
                    status: "error",
                    label: `${getAgentDisplayName(steps[activeIdx].agent)} — Error: ${event.message}`,
                };
            } else {
                steps.push({
                    id: `step-error-${now}`,
                    agent: "system",
                    label: `System Error — ${event.message}`,
                    status: "error",
                    timestamp: now,
                });
            }
            break;
        }

        case "completed": {
            // Mark all active steps completed
            return steps.map(s => s.status === "active" ? { ...s, status: "completed" } : s);
        }

        default:
            break;
    }

    return steps;
}

interface AgentActivityTraceProps {
    steps: TraceStep[];
    isComplete?: boolean;
    error?: string | null;
}

export default function AgentActivityTrace({ steps, isComplete = false, error = null }: AgentActivityTraceProps) {
    if (steps.length === 0 && !error) {
        return null;
    }

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        Live Agent Trace
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    {isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
                        </span>
                    ) : error ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Error
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                            <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> Working...
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {steps.map((step) => {
                    const isPending = step.status === "pending";
                    const isActive = step.status === "active";
                    const isDone = step.status === "completed";
                    const isErr = step.status === "error";

                    return (
                        <div
                            key={step.id}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors duration-150 ${
                                isActive
                                    ? "bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40"
                                    : "bg-slate-50/60 dark:bg-slate-800/30 border border-transparent"
                            }`}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                {isActive && <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />}
                                {isErr && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                {isPending && <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-xs truncate ${
                                    isActive
                                        ? "text-indigo-950 dark:text-indigo-200 font-bold"
                                        : isDone
                                            ? "text-slate-800 dark:text-slate-200 font-medium"
                                            : isErr
                                                ? "text-rose-700 dark:text-rose-300 font-semibold"
                                                : "text-slate-400 dark:text-slate-500"
                                }`}>
                                    {step.label}
                                </p>

                                {step.tool && (
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                                            tool: {step.tool}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div>
                        <span className="font-bold">Interrupted:</span> {error}
                    </div>
                </div>
            )}
        </div>
    );
}

