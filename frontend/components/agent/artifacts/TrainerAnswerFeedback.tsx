"use client";

import React from "react";
import { TrainerAnswerFeedbackArtifactData } from "@/types/agent";
import { CheckCircle, AlertTriangle, Lightbulb, Activity, RotateCcw, ArrowRight, Video, Mic } from "lucide-react";

interface TrainerAnswerFeedbackProps {
    data: TrainerAnswerFeedbackArtifactData;
    onRetry?: () => void;
    onContinue?: () => void;
    isAdvancing?: boolean;
}

export default function TrainerAnswerFeedback({
    data,
    onRetry,
    onContinue,
    isAdvancing = false,
}: TrainerAnswerFeedbackProps) {
    if (!data || !data.feedback) {
        return (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                Answer feedback is unavailable.
            </div>
        );
    }

    const { feedback, speech_signals, visual_signals, retry_offered, next_question } = data;
    const strengths: string[] = Array.isArray(feedback.strengths) ? feedback.strengths : [];
    const improvements: string[] = Array.isArray(feedback.improvements) ? feedback.improvements : [];
    const suggestedDirection: string = feedback.suggested_answer_direction || "";

    return (
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 backdrop-blur-md space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Activity className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-100">Trainer Evaluation & Coaching</h3>
                </div>

                {retry_offered && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                        Retry Recommended
                    </span>
                )}
            </div>

            {/* Qualitative Content Feedback: Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Strengths */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                    <span className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        What Went Well
                    </span>
                    {strengths.length > 0 ? (
                        <ul className="space-y-1.5 text-slate-300">
                            {strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    <span>{str}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 italic">Clear attempt with baseline coverage.</p>
                    )}
                </div>

                {/* Improvements */}
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                    <span className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Key Opportunities
                    </span>
                    {improvements.length > 0 ? (
                        <ul className="space-y-1.5 text-slate-300">
                            {improvements.map((imp, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{imp}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 italic">No major content weaknesses identified.</p>
                    )}
                </div>
            </div>

            {/* Suggested Direction (STAR Framework Guidance) */}
            {suggestedDirection && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                    <span className="font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Coaching Advice & Direction
                    </span>
                    <p className="leading-relaxed text-slate-300">{suggestedDirection}</p>
                </div>
            )}

            {/* "How You Delivered It" (Speech Signals) */}
            {speech_signals && (
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs space-y-2">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-indigo-400" />
                        How You Delivered It (Observed Facts)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Pace</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {speech_signals.words_per_minute ? `${speech_signals.words_per_minute} WPM` : "N/A (Typed)"}
                            </span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Filler Words</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {speech_signals.total_fillers ?? 0} detected
                            </span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Answer Length</span>
                            <span className="text-xs font-semibold text-slate-200 capitalize">
                                {speech_signals.answer_length_band?.replace("_", " ") || "Optimal"}
                            </span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Pauses (&gt;2.5s)</span>
                            <span className="text-xs font-semibold text-slate-200">
                                {speech_signals.long_pause_count ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Framing Signals (Rendered ONLY if camera was enabled) */}
            {visual_signals?.camera_enabled && (
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-indigo-400" />
                        Visual Framing (Local Observation)
                    </span>
                    <div className="flex items-center justify-between text-slate-300 pt-1">
                        <span>{visual_signals.framing_note || "Centered on-screen"}</span>
                        <span className="text-[10px] text-slate-400">
                            In-frame: {Math.round((visual_signals.face_detected_ratio ?? 1) * 100)}%
                        </span>
                    </div>
                </div>
            )}

            {/* Interactive Turn Continuation Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {retry_offered && onRetry ? (
                    <button
                        type="button"
                        onClick={onRetry}
                        disabled={isAdvancing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Question (Apply Feedback)</span>
                    </button>
                ) : (
                    <div />
                )}

                {onContinue && (
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={isAdvancing}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-md ml-auto"
                    >
                        <span>{next_question ? "Next Question" : "Complete & View Report"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
