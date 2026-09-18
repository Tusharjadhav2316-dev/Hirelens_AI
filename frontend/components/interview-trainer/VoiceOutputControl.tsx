"use client";

import React from "react";
import { PlaybackState } from "@/hooks/useInterviewAudioPlayer";
import { Volume2, VolumeX, Square, Sparkles, AlertCircle } from "lucide-react";

interface VoiceOutputControlProps {
    playbackState: PlaybackState;
    isMuted: boolean;
    currentCaption: string;
    isAutoplayBlocked: boolean;
    onToggleMute: () => void;
    onInterrupt: () => void;
    onRetryAutoplay?: () => void;
}

export const VoiceOutputControl: React.FC<VoiceOutputControlProps> = ({
    playbackState,
    isMuted,
    currentCaption,
    isAutoplayBlocked,
    onToggleMute,
    onInterrupt,
    onRetryAutoplay,
}) => {
    const isSpeaking = playbackState === "PLAYING";
    const isBuffering = playbackState === "BUFFERING";

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all">
            {/* Header & Controls Bar */}
            <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                        {isSpeaking && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                AI Trainer Voice
                            </span>
                            {isSpeaking && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                                    Speaking
                                </span>
                            )}
                            {isBuffering && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded animate-pulse">
                                    Buffering...
                                </span>
                            )}
                            {isMuted && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded">
                                    Muted
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Interactive Action Controls */}
                <div className="flex items-center gap-2">
                    {/* Interrupt / Skip Audio Button */}
                    {(isSpeaking || isBuffering) && (
                        <button
                            type="button"
                            onClick={onInterrupt}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors shadow-sm"
                            title="Interrupt trainer speech"
                        >
                            <Square className="w-3.5 h-3.5 fill-amber-300" />
                            <span>Interrupt</span>
                        </button>
                    )}

                    {/* Mute Toggle */}
                    <button
                        type="button"
                        onClick={onToggleMute}
                        className={`p-1.5 rounded-lg border transition-all ${
                            isMuted
                                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                        }`}
                        title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Soundwave Animation when Speaking */}
            {isSpeaking && (
                <div className="flex items-center justify-center gap-1 py-1.5 mb-2.5">
                    <div className="w-1 bg-indigo-400 rounded-full h-3 animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <div className="w-1 bg-indigo-400 rounded-full h-5 animate-[pulse_0.8s_ease-in-out_infinite_0.1s]" />
                    <div className="w-1 bg-indigo-400 rounded-full h-4 animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
                    <div className="w-1 bg-indigo-400 rounded-full h-6 animate-[pulse_0.9s_ease-in-out_infinite_0.15s]" />
                    <div className="w-1 bg-indigo-400 rounded-full h-3 animate-[pulse_0.7s_ease-in-out_infinite_0.25s]" />
                </div>
            )}

            {/* Browser Autoplay Blocked Notice */}
            {isAutoplayBlocked && (
                <div className="flex items-center justify-between p-2.5 mb-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>Browser autoplay blocked audio playback.</span>
                    </div>
                    {onRetryAutoplay && (
                        <button
                            type="button"
                            onClick={onRetryAutoplay}
                            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded font-medium transition-colors"
                        >
                            Enable Audio
                        </button>
                    )}
                </div>
            )}

            {/* Synchronized Live Captions */}
            {currentCaption ? (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed font-sans">
                    <p className="line-clamp-4">{currentCaption}</p>
                </div>
            ) : (
                <div className="text-xs text-slate-500 italic py-1">
                    Captions will appear here when the trainer speaks...
                </div>
            )}
        </div>
    );
};
