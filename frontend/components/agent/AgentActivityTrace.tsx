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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Agent Execution Trace
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    {isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                    ) : error ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50">
                            <AlertCircle className="w-3 h-3" /> Error
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" /> Processing...
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {steps.map((step) => {
                    const isPending = step.status === "pending";
                    const isActive = step.status === "active";
                    const isDone = step.status === "completed";
                    const isErr = step.status === "error";

                    return (
                        <div
                            key={step.id}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors duration-150 ${
                                isActive
                                    ? "bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-800/40"
                                    : "bg-slate-50/50 dark:bg-slate-800/30"
                            }`}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                                {isActive && <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />}
                                {isErr && <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />}
                                {isPending && <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className={`text-xs font-medium truncate ${
                                        isActive
                                            ? "text-blue-900 dark:text-blue-200 font-semibold"
                                            : isDone
                                                ? "text-slate-800 dark:text-slate-200"
                                                : isErr
                                                    ? "text-red-700 dark:text-red-300"
                                                    : "text-slate-500 dark:text-slate-400"
                                    }`}>
                                        {step.label}
                                    </p>
                                </div>

                                {step.tool && (
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                            Running: {step.tool}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                    <div>
                        <span className="font-semibold">Execution Interrupted:</span> {error}
                    </div>
                </div>
            )}
        </div>
    );
}
