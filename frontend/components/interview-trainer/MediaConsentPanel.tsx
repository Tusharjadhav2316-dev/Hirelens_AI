"use client";

import React from "react";
import { Mic, Video, Shield, CheckCircle, AlertCircle } from "lucide-react";

interface MediaConsentPanelProps {
  micEnabled: boolean;
  onMicToggle: (val: boolean) => void;
  cameraEnabled: boolean;
  onCameraToggle: (val: boolean) => void;
}

export default function MediaConsentPanel({
  micEnabled,
  onMicToggle,
  cameraEnabled,
  onCameraToggle,
}: MediaConsentPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Multimodal Media & Privacy Settings
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Configure microphone and optional camera presence for your interview session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Microphone Consent Card */}
        <div className={`p-4 rounded-xl border transition-all ${
          micEnabled
            ? "border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Microphone (Voice Mode)
                </h4>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  Spoken Answer Practice
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={micEnabled}
                onChange={(e) => onMicToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Speak your answers naturally. Real-time delivery pace and filler word counts will be computed.
          </p>
          <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Audio is transcribed in-memory. Raw audio is <strong>never stored</strong>.</span>
          </div>
        </div>

        {/* Camera Consent Card */}
        <div className={`p-4 rounded-xl border transition-all ${
          cameraEnabled
            ? "border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Camera Presence (Optional)
                </h4>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  Framing & Eye-Level Feedback
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cameraEnabled}
                onChange={(e) => onCameraToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Helps verify camera centering and lighting. Zero emotion detection or facial expression scoring.
          </p>
          <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Processed <strong>100% in-browser</strong>. Frames never leave your device.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
