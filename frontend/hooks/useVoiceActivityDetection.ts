"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface VoiceActivityDetectionOptions {
    enabled?: boolean;
    silenceThresholdMs?: number; // Duration of silence to trigger onSilenceDetected
    minEnergyThreshold?: number; // RMS threshold below which audio is considered silence (0.0 - 1.0)
    onSilenceDetected?: () => void;
}

export interface VoiceActivityDetectionResult {
    audioLevel: number; // 0 to 100 (normalized for visual level meters)
    isSpeaking: boolean;
    isSilent: boolean;
}

export function useVoiceActivityDetection(
    mediaStream: MediaStream | null,
    options: VoiceActivityDetectionOptions = {}
): VoiceActivityDetectionResult {
    const {
        enabled = false,
        silenceThresholdMs = 2500,
        minEnergyThreshold = 0.015,
        onSilenceDetected,
    } = options;

    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isSilent, setIsSilent] = useState<boolean>(true);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const silenceStartRef = useRef<number | null>(null);
    const silenceNotifiedRef = useRef<boolean>(false);

    const cleanup = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        setAudioLevel(0);
        setIsSpeaking(false);
        setIsSilent(true);
        silenceStartRef.current = null;
        silenceNotifiedRef.current = false;
    }, []);

    useEffect(() => {
        if (!enabled || !mediaStream || !mediaStream.active) {
            cleanup();
            return;
        }

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                return;
            }

            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.3;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(mediaStream);
            source.connect(analyser);
            sourceRef.current = source;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyzeLoop = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                // Calculate RMS energy from frequency bins
                let sumSquares = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const normalized = dataArray[i] / 255;
                    sumSquares += normalized * normalized;
                }
                const rms = Math.sqrt(sumSquares / bufferLength);

                // Scale to 0-100 for UI display
                const level = Math.min(100, Math.round(rms * 250));
                setAudioLevel(level);

                const now = Date.now();
                const speaking = rms > minEnergyThreshold;
                setIsSpeaking(speaking);
                setIsSilent(!speaking);

                if (speaking) {
                    silenceStartRef.current = null;
                    silenceNotifiedRef.current = false;
                } else {
                    if (silenceStartRef.current === null) {
                        silenceStartRef.current = now;
                    } else if (
                        now - silenceStartRef.current >= silenceThresholdMs &&
                        !silenceNotifiedRef.current
                    ) {
                        silenceNotifiedRef.current = true;
                        if (onSilenceDetected) {
                            onSilenceDetected();
                        }
                    }
                }

                animationFrameRef.current = requestAnimationFrame(analyzeLoop);
            };

            analyzeLoop();
        } catch (err) {
            console.error("[useVoiceActivityDetection error]", err);
            cleanup();
        }

        return () => {
            cleanup();
        };
    }, [enabled, mediaStream, silenceThresholdMs, minEnergyThreshold, onSilenceDetected, cleanup]);

    return {
        audioLevel,
        isSpeaking,
        isSilent,
    };
}
