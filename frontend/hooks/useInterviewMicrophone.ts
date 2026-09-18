"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useVoiceActivityDetection } from "./useVoiceActivityDetection";

export type MicrophoneState =
    | "OFF"
    | "REQUESTING"
    | "READY"
    | "LISTENING"
    | "PROCESSING"
    | "ERROR"
    | "BLOCKED";

export interface UseInterviewMicrophoneOptions {
    maxDurationSeconds?: number;
    onSilenceDetected?: () => void;
    onAutoStop?: () => void;
    authGetter?: () => Promise<string | null>; // Returns Firebase ID token for authenticated STT
}

export interface UseInterviewMicrophoneReturn {
    state: MicrophoneState;
    recordingDuration: number;
    audioLevel: number;
    transcript: string;
    error: string | null;
    isSupported: boolean;
    isSubmitting: boolean;
    requestPermission: () => Promise<boolean>;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    submitRecording: (languageCode?: string) => Promise<string | null>;
    cancelRecording: () => void;
    reset: () => void;
}

const DEFAULT_MAX_RECORDING_SECONDS = 180; // 3 minutes hard cap

export function useInterviewMicrophone(
    options: UseInterviewMicrophoneOptions = {}
): UseInterviewMicrophoneReturn {
    const {
        maxDurationSeconds = DEFAULT_MAX_RECORDING_SECONDS,
        onSilenceDetected,
        onAutoStop,
        authGetter,
    } = options;

    const [state, setState] = useState<MicrophoneState>("OFF");
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const [transcript, setTranscript] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(true);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    // Hook-scoped refs (strictly zero module globals)
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isSubmittingRef = useRef<boolean>(false);
    const recordedBlobRef = useRef<Blob | null>(null);

    // Assistive VAD hook (RMS level for UI meters & silence detection)
    const { audioLevel } = useVoiceActivityDetection(mediaStream, {
        enabled: state === "LISTENING",
        onSilenceDetected,
    });

    // Check browser support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const supported = Boolean(
                navigator?.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function"
            );
            setIsSupported(supported);
            if (!supported) {
                setState("ERROR");
                setError("Your browser does not support microphone audio capture.");
            }
        }
    }, []);

    // Helper to stop all tracks and release hardware mic lock
    const releaseMediaStream = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => {
                try {
                    track.stop();
                } catch {}
            });
            mediaStreamRef.current = null;
        }
        setMediaStream(null);
    }, []);

    const clearTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    // 1. Request Permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setState("ERROR");
            setError("Microphone is not supported in this browser.");
            return false;
        }

        setState("REQUESTING");
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            mediaStreamRef.current = stream;
            setMediaStream(stream);
            setState("READY");
            return true;
        } catch (err: any) {
            console.error("[useInterviewMicrophone permission error]", err);
            if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                setState("BLOCKED");
                setError("Microphone access was blocked. Please enable permissions in your browser or type instead.");
            } else {
                setState("ERROR");
                setError(err?.message || "Failed to access microphone.");
            }
            releaseMediaStream();
            return false;
        }
    }, [isSupported, releaseMediaStream]);

    // 2. Start Recording
    const startRecording = useCallback(async () => {
        if (state === "LISTENING" || isSubmittingRef.current) return;

        // Ensure we have an active stream
        let stream = mediaStreamRef.current;
        if (!stream || !stream.active) {
            const granted = await requestPermission();
            if (!granted) return;
            stream = mediaStreamRef.current;
        }

        if (!stream) {
            setState("ERROR");
            setError("No active audio stream.");
            return;
        }

        try {
            audioChunksRef.current = [];
            recordedBlobRef.current = null;
            setRecordingDuration(0);
            setTranscript("");
            setError(null);

            // Determine best supported MIME type
            let mimeType = "audio/webm";
            if (typeof MediaRecorder !== "undefined") {
                if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                    mimeType = "audio/webm";
                } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                    mimeType = "audio/mp4";
                }
            }

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const combinedBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
                recordedBlobRef.current = combinedBlob;
            };

            recorder.start(200); // 200ms timeslices
            setState("LISTENING");

            // Start duration timer and enforce 3-minute hard stop
            clearTimer();
            const startTime = Date.now();
            timerIntervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                setRecordingDuration(elapsed);

                if (elapsed >= maxDurationSeconds) {
                    // Hard stop reached
                    if (recorder.state === "recording") {
                        recorder.stop();
                        clearTimer();
                        setState("READY");
                        if (onAutoStop) {
                            onAutoStop();
                        }
                    }
                }
            }, 500);

        } catch (err: any) {
            console.error("[useInterviewMicrophone start error]", err);
            setState("ERROR");
            setError("Failed to start audio recording.");
            clearTimer();
        }
    }, [state, maxDurationSeconds, requestPermission, clearTimer, onAutoStop]);

    // 3. Stop Recording
    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        clearTimer();

        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
            if (recordedBlobRef.current) return recordedBlobRef.current;
            if (audioChunksRef.current.length > 0) {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                recordedBlobRef.current = blob;
                return blob;
            }
            setState("READY");
            return null;
        }

        return new Promise((resolve) => {
            recorder.onstop = () => {
                const combinedBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
                recordedBlobRef.current = combinedBlob;
                setState("READY");
                resolve(combinedBlob);
            };
            recorder.stop();
        });
    }, [clearTimer]);

    // 4. Submit Recording to Authenticated STT Route
    const submitRecording = useCallback(
        async (languageCode: string = "en-IN"): Promise<string | null> => {
            // Transition lock: prevent double-clicks or rapid race conditions
            if (isSubmittingRef.current) {
                return null;
            }

            isSubmittingRef.current = true;
            setState("PROCESSING");
            setError(null);

            try {
                // Ensure recording is stopped and blob is extracted
                let blob = recordedBlobRef.current;
                if (!blob || mediaRecorderRef.current?.state === "recording") {
                    blob = await stopRecording();
                }

                if (!blob || blob.size < 500) {
                    setState("READY");
                    setError("Recording is too short or silent. Please speak clearly or type your response.");
                    isSubmittingRef.current = false;
                    return null;
                }

                // Get auth token if provider configured
                let token: string | null = null;
                if (authGetter) {
                    token = await authGetter();
                }

                const formData = new FormData();
                formData.append("file", blob, "audio.webm");
                formData.append("languageCode", languageCode);
                formData.append("durationSeconds", String(recordingDuration));

                const headers: Record<string, string> = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const res = await fetch("/api/interview/stt", {
                    method: "POST",
                    headers,
                    body: formData,
                });

                if (!res.ok) {
                    const errJson = await res.json().catch(() => ({}));
                    if (res.status === 401) {
                        throw new Error("Authentication required to transcribe voice answers.");
                    } else if (res.status === 413) {
                        throw new Error("Audio recording exceeded maximum size limit (15MB).");
                    } else if (errJson.code === "NOT_CONFIGURED" || res.status === 503) {
                        throw new Error("Speech provider is not configured. Please use typing mode.");
                    }
                    throw new Error(errJson.error || `Transcription failed with status ${res.status}`);
                }

                const data = await res.json();
                const transcribedText = (data.transcript || "").trim();
                setTranscript(transcribedText);
                setState("READY");
                isSubmittingRef.current = false;
                return transcribedText;

            } catch (err: any) {
                console.error("[useInterviewMicrophone submit error]", err);
                setState("ERROR");
                setError(err?.message || "Failed to transcribe audio.");
                isSubmittingRef.current = false;
                return null;
            }
        },
        [stopRecording, authGetter, recordingDuration]
    );

    // 5. Cancel Recording
    const cancelRecording = useCallback(() => {
        clearTimer();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            try {
                mediaRecorderRef.current.stop();
            } catch {}
        }
        audioChunksRef.current = [];
        recordedBlobRef.current = null;
        setRecordingDuration(0);
        isSubmittingRef.current = false;
        setState("READY");
    }, [clearTimer]);

    // 6. Reset
    const reset = useCallback(() => {
        cancelRecording();
        releaseMediaStream();
        setTranscript("");
        setError(null);
        setState("OFF");
    }, [cancelRecording, releaseMediaStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimer();
            releaseMediaStream();
        };
    }, [clearTimer, releaseMediaStream]);

    return {
        state,
        recordingDuration,
        audioLevel,
        transcript,
        error,
        isSupported,
        isSubmitting: isSubmittingRef.current,
        requestPermission,
        startRecording,
        stopRecording,
        submitRecording,
        cancelRecording,
        reset,
    };
}
