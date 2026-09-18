"use client";

import React from "react";
import { CameraState } from "@/hooks/useInterviewCamera";
import { Video, VideoOff, ShieldCheck, AlertTriangle, Eye } from "lucide-react";

interface CameraPreviewProps {
    cameraState: CameraState;
    errorMessage?: string | null;
    onStartCamera: () => void;
    onStopCamera: () => void;
    videoRefCallback: (node: HTMLVideoElement | null) => void;
    framingNote?: string;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
    cameraState,
    errorMessage,
    onStartCamera,
    onStopCamera,
    videoRefCallback,
    framingNote,
}) => {
    const isActive = cameraState === "ACTIVE";
    const isRequesting = cameraState === "REQUESTING";
    const isBlocked = cameraState === "BLOCKED";

    return (
        <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
            {/* Video Viewport Container */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Active Video Stream */}
                <video
                    ref={videoRefCallback}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover mirror-mode transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                    }`}
                    style={{ transform: "scaleX(-1)" }} // Mirror effect for natural video self-view
                />

                {/* Framing Guidelines Overlay when Active */}
                {isActive && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/20 m-4 rounded-lg flex flex-col justify-between p-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[10px] font-semibold text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE FEED
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                                Local Only
                            </span>
                        </div>

                        {framingNote && (
                            <div className="self-center bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-full text-[11px] text-slate-300 shadow-md flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{framingNote}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Placeholder View when Camera is OFF */}
                {!isActive && !isBlocked && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                            <VideoOff className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-1">Camera is Optional</h4>
                        <p className="text-xs text-slate-500 max-w-xs mb-4">
                            You can practice with video framing feedback or continue with audio/text only.
                        </p>
                        <button
                            type="button"
                            onClick={onStartCamera}
                            disabled={isRequesting}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
                        >
                            <Video className="w-4 h-4" />
                            <span>{isRequesting ? "Requesting Access..." : "Enable Camera"}</span>
                        </button>
                    </div>
                )}

                {/* Blocked / Error State View */}
                {isBlocked && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-amber-300 mb-1">Camera Access Blocked</h4>
                        <p className="text-xs text-slate-400 max-w-xs">
                            {errorMessage || "Permission was denied. The interview trainer continues seamlessly in audio and text modes."}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Action & Privacy Assurance */}
            <div className="flex items-center justify-between p-3 bg-slate-900 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px]">
                        Video is analyzed locally in real-time. Frames are <strong>never recorded or stored</strong>.
                    </span>
                </div>

                {isActive && (
                    <button
                        type="button"
                        onClick={onStopCamera}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded transition-colors"
                    >
                        Turn Off Camera
                    </button>
                )}
            </div>
        </div>
    );
};
