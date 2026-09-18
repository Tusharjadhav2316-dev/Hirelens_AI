"use client";

import React from "react";
import { Mic, MicOff, Square, AlertCircle, RefreshCw, MessageSquare, Volume2 } from "lucide-react";
import { MicrophoneState } from "@/hooks/useInterviewMicrophone";

export interface MicrophoneControlProps {
    state: MicrophoneState;
    audioLevel: number; // 0 to 100
    recordingDuration: number; // in seconds
    isSubmitting?: boolean;
    error?: string | null;
    maxDurationSeconds?: number;
    onStartRecording: () => void;
    onDoneSpeaking: () => void;
    onCancelRecording?: () => void;
    onSwitchToTyping: () => void;
    onRequestPermission?: () => void;
}

export const MicrophoneControl: React.FC<MicrophoneControlProps> = ({
    state,
    audioLevel,
    recordingDuration,
    isSubmitting = false,
    error,
    maxDurationSeconds = 180,
    onStartRecording,
    onDoneSpeaking,
    onCancelRecording,
    onSwitchToTyping,
    onRequestPermission,
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isListening = state === "LISTENING";
    const isProcessing = state === "PROCESSING" || isSubmitting;
    const isBlocked = state === "BLOCKED";
    const isError = state === "ERROR";
    const isReady = state === "READY";
    const isOff = state === "OFF" || state === "REQUESTING";

    const progressPct = Math.min(100, Math.round((recordingDuration / maxDurationSeconds) * 100));

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl text-white">
            {/* Header / State Indicator */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                        isListening
                            ? "bg-rose-500 animate-ping"
                            : isProcessing
                            ? "bg-amber-400 animate-spin"
                            : isReady
                            ? "bg-emerald-400"
                            : isBlocked
                            ? "bg-red-500"
                            : "bg-slate-500"
                    }`} />
                    <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">
                        {isListening
                            ? "Listening (Microphone Live)"
                            : isProcessing
                            ? "Transcribing Audio..."
                            : isReady
                            ? "Microphone Ready"
                            : isBlocked
                            ? "Microphone Blocked"
                            : isError
                            ? "Audio Error"
                            : "Microphone Inactive"}
                    </span>
                </div>

                {/* Duration Timer */}
                {isListening && (
                    <div className="flex items-center gap-2 text-sm font-mono text-rose-400 font-bold bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/40">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        {formatTime(recordingDuration)} / {formatTime(maxDurationSeconds)}
                    </div>
                )}
            </div>

            {/* Error or Blocked Banner */}
            {(isBlocked || (isError && error)) && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">{isBlocked ? "Microphone Permission Blocked" : "Microphone Error"}</p>
                        <p className="text-xs text-red-300 mt-1">{error || "Please allow microphone access or switch to typing mode."}</p>
                    </div>
                </div>
            )}

            {/* Live Audio Visualizer & Level Meter */}
            {isListening && (
                <div className="my-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                            Voice Level
                        </span>
                        <span>{audioLevel}%</span>
                    </div>

                    {/* Visualizer multi-bar display */}
                    <div className="flex items-end justify-center gap-1.5 h-14 bg-slate-950/70 rounded-xl p-2 border border-slate-800/80">
                        {Array.from({ length: 24 }).map((_, idx) => {
                            const multiplier = 0.5 + Math.sin((idx / 24) * Math.PI) * 0.5;
                            const barHeight = Math.max(8, Math.min(100, Math.round(audioLevel * multiplier * 1.2)));
                            return (
                                <div
                                    key={idx}
                                    className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-rose-400 transition-all duration-75"
                                    style={{ height: `${barHeight}%` }}
                                />
                            );
                        })}
                    </div>

                    {/* Progress Bar towards 3-minute hard stop */}
                    <div className="w-full bg-slate-800 rounded-full h-1 mt-3 overflow-hidden">
                        <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Controls Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/60">
                {/* Left Side: Type Instead Escape Hatch */}
                <button
                    type="button"
                    onClick={onSwitchToTyping}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                >
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Type instead</span>
                </button>

                {/* Right Side: Primary Mic Action Buttons */}
                <div className="flex items-center gap-2.5">
                    {isListening ? (
                        <>
                            {onCancelRecording && (
                                <button
                                    type="button"
                                    onClick={onCancelRecording}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onDoneSpeaking}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 transition-all shadow-lg shadow-rose-900/30"
                            >
                                <Square className="w-4 h-4 fill-white" />
                                <span>I'm Done Speaking</span>
                            </button>
                        </>
                    ) : isProcessing ? (
                        <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-950/60 border border-amber-800/40">
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Transcribing...</span>
                        </div>
                    ) : isBlocked ? (
                        <button
                            type="button"
                            onClick={onRequestPermission || onStartRecording}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            <MicOff className="w-4 h-4 text-red-400" />
                            <span>Retry Permission</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onStartRecording}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all shadow-lg shadow-indigo-900/30"
                        >
                            <Mic className="w-4 h-4 text-white" />
                            <span>Start Speaking</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
