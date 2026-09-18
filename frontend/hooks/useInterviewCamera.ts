"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { detectFace, loadDetectionModel } from "@/lib/vision/faceDetection";
import { computeVisualSignals, FaceSample, VisualSignals } from "@/lib/vision/computeVisualSignals";

export type CameraState = "OFF" | "REQUESTING" | "READY" | "ACTIVE" | "PAUSED" | "BLOCKED" | "ERROR";

export function useInterviewCamera() {
    const [cameraState, setCameraState] = useState<CameraState>("OFF");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Hook-scoped refs (zero module globals)
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const samplesRef = useRef<FaceSample[]>([]);
    const samplingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Stop and cleanly release all hardware video tracks
    const stopCamera = useCallback(() => {
        if (samplingIntervalRef.current) {
            clearInterval(samplingIntervalRef.current);
            samplingIntervalRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            mediaStreamRef.current = null;
        }

        if (videoElementRef.current) {
            videoElementRef.current.srcObject = null;
        }

        setCameraState("OFF");
        setErrorMessage(null);
    }, []);

    // Request camera permission and start video stream
    const startCamera = useCallback(async () => {
        if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
            setCameraState("ERROR");
            setErrorMessage("Camera is not supported on this browser/environment.");
            return;
        }

        setCameraState("REQUESTING");
        setErrorMessage(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user",
                },
                audio: false, // Voice is handled separately by useInterviewMicrophone
            });

            mediaStreamRef.current = stream;

            if (videoElementRef.current) {
                videoElementRef.current.srcObject = stream;
                await videoElementRef.current.play().catch(() => {});
            }

            // Lazy load detection model
            loadDetectionModel().catch(() => {});

            setCameraState("ACTIVE");
        } catch (err: any) {
            console.warn("[InterviewCamera] getUserMedia failed:", err?.name, err?.message);
            if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                setCameraState("BLOCKED");
                setErrorMessage("Camera access was blocked. You can continue in audio/text mode.");
            } else {
                setCameraState("ERROR");
                setErrorMessage(err?.message || "Could not start camera video stream.");
            }
        }
    }, []);

    // Begin 1-2 Hz sampling loop during candidate answering turn
    const startSampling = useCallback(() => {
        samplesRef.current = [];
        if (samplingIntervalRef.current) {
            clearInterval(samplingIntervalRef.current);
        }

        if (cameraState !== "ACTIVE" || !videoElementRef.current) {
            return;
        }

        samplingIntervalRef.current = setInterval(async () => {
            if (videoElementRef.current && cameraState === "ACTIVE") {
                const res = await detectFace(videoElementRef.current);
                samplesRef.current.push({
                    timestampMs: Date.now(),
                    faceDetected: res.faceDetected,
                    box: res.box,
                });
            }
        }, 1000); // 1 Hz low-frequency sampling
    }, [cameraState]);

    // Halt sampling loop and return computed visual signals
    const stopSamplingAndGetSignals = useCallback((): VisualSignals => {
        if (samplingIntervalRef.current) {
            clearInterval(samplingIntervalRef.current);
            samplingIntervalRef.current = null;
        }

        const isEnabled = cameraState === "ACTIVE" || cameraState === "READY";
        const signals = computeVisualSignals(samplesRef.current, isEnabled);
        samplesRef.current = [];
        return signals;
    }, [cameraState]);

    // Attach video element ref callback
    const setVideoElement = useCallback((node: HTMLVideoElement | null) => {
        videoElementRef.current = node;
        if (node && mediaStreamRef.current) {
            node.srcObject = mediaStreamRef.current;
            node.play().catch(() => {});
        }
    }, []);

    // Clean teardown on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        cameraState,
        errorMessage,
        startCamera,
        stopCamera,
        startSampling,
        stopSamplingAndGetSignals,
        setVideoElement,
        isCameraActive: cameraState === "ACTIVE",
    };
}
