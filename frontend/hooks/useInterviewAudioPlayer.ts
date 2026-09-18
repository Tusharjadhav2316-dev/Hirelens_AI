"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";

export type PlaybackState = "IDLE" | "BUFFERING" | "PLAYING" | "PAUSED" | "ERROR";

export interface SpeakOptions {
    languageCode?: string;
    voiceId?: string;
    pace?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: Error) => void;
}

interface QueueItem {
    id: string;
    text: string;
    options?: SpeakOptions;
    generationId: number;
}

const MAX_QUEUE_ITEMS = 3; // Bounded queue protecting against runaway speech enqueues

export function useInterviewAudioPlayer() {
    const [playbackState, setPlaybackState] = useState<PlaybackState>("IDLE");
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [currentCaption, setCurrentCaption] = useState<string>("");
    const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);

    // Hook-scoped refs (zero module globals)
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const activeBlobUrlRef = useRef<string | null>(null);
    const queueRef = useRef<QueueItem[]>([]);
    const isProcessingQueueRef = useRef<boolean>(false);
    const generationRef = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Safe revoke helper
    const revokeActiveBlobUrl = useCallback(() => {
        if (activeBlobUrlRef.current && typeof window !== "undefined" && window.URL) {
            try {
                window.URL.revokeObjectURL(activeBlobUrlRef.current);
            } catch (_) {
                // Ignore cleanup error
            }
            activeBlobUrlRef.current = null;
        }
    }, []);

    // Stop speaking immediately & cancel any pending synthesis
    const stopSpeaking = useCallback(() => {
        // 1. Invalidate pending requests and abort in-flight fetch
        generationRef.current += 1;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // 2. Clear playback queue
        queueRef.current = [];
        isProcessingQueueRef.current = false;

        // 3. Halt audio element
        if (audioElementRef.current) {
            try {
                audioElementRef.current.pause();
                audioElementRef.current.currentTime = 0;
                audioElementRef.current.src = "";
            } catch (_) {
                // Ignore pause error
            }
        }

        // 4. Release object URL
        revokeActiveBlobUrl();

        setPlaybackState("IDLE");
    }, [revokeActiveBlobUrl]);

    // Process next item in FIFO queue
    const processQueue = useCallback(async () => {
        if (isProcessingQueueRef.current || queueRef.current.length === 0) {
            return;
        }

        const item = queueRef.current.shift();
        if (!item) {
            return;
        }

        // If request generation was invalidated by an interrupt, drop item
        if (item.generationId !== generationRef.current) {
            processQueue();
            return;
        }

        isProcessingQueueRef.current = true;
        setCurrentCaption(item.text);

        // Mute Optimization: If muted, do not request TTS or play audio
        if (isMuted) {
            setPlaybackState("IDLE");
            item.options?.onEnd?.();
            isProcessingQueueRef.current = false;
            processQueue();
            return;
        }

        setPlaybackState("BUFFERING");

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const currentGen = item.generationId;

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error("Authentication required for TTS");
            }

            const response = await fetch("/api/interview/tts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: item.text,
                    languageCode: item.options?.languageCode || "en-IN",
                    voiceId: item.options?.voiceId || "meera",
                    pace: item.options?.pace || 1.0,
                }),
                signal: controller.signal,
            });

            // Late response check: If interrupted while fetching, ignore response
            if (currentGen !== generationRef.current) {
                isProcessingQueueRef.current = false;
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 503 || errData?.canFallbackToText) {
                    // Fallback cleanly to captions without throwing fatal error
                    setPlaybackState("IDLE");
                    item.options?.onEnd?.();
                    isProcessingQueueRef.current = false;
                    processQueue();
                    return;
                }
                throw new Error(errData?.error || `TTS request failed with status ${response.status}`);
            }

            const data = await response.json();
            const base64Data = data?.audioBase64;

            if (!base64Data || currentGen !== generationRef.current) {
                isProcessingQueueRef.current = false;
                return;
            }

            // Convert base64 to Blob & Object URL
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: data.format || "audio/wav" });

            revokeActiveBlobUrl();
            const audioUrl = URL.createObjectURL(blob);
            activeBlobUrlRef.current = audioUrl;

            // Late check before creating playback
            if (currentGen !== generationRef.current) {
                revokeActiveBlobUrl();
                isProcessingQueueRef.current = false;
                return;
            }

            if (!audioElementRef.current) {
                audioElementRef.current = new Audio();
            }

            const audio = audioElementRef.current;
            audio.src = audioUrl;

            const handleEnded = () => {
                cleanupListeners();
                revokeActiveBlobUrl();
                setPlaybackState("IDLE");
                item.options?.onEnd?.();
                isProcessingQueueRef.current = false;
                processQueue();
            };

            const handleError = (e: any) => {
                cleanupListeners();
                revokeActiveBlobUrl();
                console.warn("[InterviewAudioPlayer Error]", e);
                setPlaybackState("ERROR");
                item.options?.onError?.(new Error("Audio playback failed"));
                isProcessingQueueRef.current = false;
                processQueue();
            };

            const cleanupListeners = () => {
                audio.removeEventListener("ended", handleEnded);
                audio.removeEventListener("error", handleError);
            };

            audio.addEventListener("ended", handleEnded);
            audio.addEventListener("error", handleError);

            setPlaybackState("PLAYING");
            item.options?.onStart?.();

            try {
                await audio.play();
                setIsAutoplayBlocked(false);
            } catch (playErr: any) {
                cleanupListeners();
                revokeActiveBlobUrl();
                isProcessingQueueRef.current = false;

                if (playErr?.name === "NotAllowedError") {
                    // Autoplay policy blocked initial playback
                    setIsAutoplayBlocked(true);
                    setPlaybackState("ERROR");
                } else {
                    setPlaybackState("ERROR");
                    item.options?.onError?.(playErr);
                }
                processQueue();
            }

        } catch (fetchErr: any) {
            if (fetchErr?.name === "AbortError" || currentGen !== generationRef.current) {
                // Intentionally aborted / interrupted
                isProcessingQueueRef.current = false;
                return;
            }

            console.warn("[InterviewAudioPlayer Synthesize Error]", fetchErr?.message);
            setPlaybackState("ERROR");
            item.options?.onError?.(fetchErr);
            isProcessingQueueRef.current = false;
            processQueue();
        }
    }, [isMuted, revokeActiveBlobUrl]);

    // Enqueue an utterance for trainer speech
    const speak = useCallback((text: string, options?: SpeakOptions) => {
        if (!text || text.trim().length === 0) {
            return;
        }

        const trimmed = text.trim();

        // If queue exceeds MAX_QUEUE_ITEMS, drop oldest or reject
        if (queueRef.current.length >= MAX_QUEUE_ITEMS) {
            queueRef.current.shift();
        }

        const item: QueueItem = {
            id: `utt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            text: trimmed,
            options,
            generationId: generationRef.current,
        };

        queueRef.current.push(item);

        if (!isProcessingQueueRef.current) {
            processQueue();
        }
    }, [processQueue]);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;
            if (next) {
                stopSpeaking();
            }
            return next;
        });
    }, [stopSpeaking]);

    // Retry playback if unblocked by user interaction
    const retryAutoplay = useCallback(() => {
        setIsAutoplayBlocked(false);
        setPlaybackState("IDLE");
        if (currentCaption) {
            speak(currentCaption);
        }
    }, [currentCaption, speak]);

    // Lifecycle Teardown
    useEffect(() => {
        return () => {
            stopSpeaking();
            if (audioElementRef.current) {
                audioElementRef.current.src = "";
                audioElementRef.current = null;
            }
        };
    }, [stopSpeaking]);

    return {
        playbackState,
        isMuted,
        currentCaption,
        isAutoplayBlocked,
        speak,
        stopSpeaking,
        toggleMute,
        setIsMuted,
        retryAutoplay,
    };
}
