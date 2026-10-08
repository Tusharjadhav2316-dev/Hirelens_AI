import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  CheckCircle2,
  CircleDot,
  Circle,
  Clock,
  BookOpen,
  Code2,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";
import { CareerRoadmap, RoadmapStep } from "./CareerCoachTypes";

interface RoadmapDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: CareerRoadmap;
}

export default function RoadmapDetailsModal({
  isOpen,
  onClose,
  roadmap,
}: RoadmapDetailsModalProps) {
  const [selectedStepId, setSelectedStepId] = useState<number>(
    roadmap.steps[1]?.id || roadmap.steps[0]?.id || 1
  );

  useEffect(() => {
    const currentStep = roadmap.steps.find((s) => s.status === "current") || roadmap.steps[0];
    if (currentStep) {
      setSelectedStepId(currentStep.id);
    }
  }, [roadmap]);

  if (!isOpen) return null;

  const currentStep =
    roadmap.steps.find((s) => s.id === selectedStepId) || roadmap.steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {roadmap.roleTitle}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {roadmap.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed milestone roadmap, actionable deliverables, and career advancement criteria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          {/* Steps Navigation List (Left 5 cols) */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-100 dark:border-slate-800 pr-0 md:pr-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Milestone Sequence (6 Stages)
            </h3>

            {roadmap.steps.map((step) => {
              const isSelected = step.id === selectedStepId;
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/90 text-blue-950 dark:text-blue-100 shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <CircleDot className="w-4 h-4 text-blue-600 animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">
                        {step.number}. {step.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : isCurrent
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {step.estimatedWeeks}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step Detail Content (Right 7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-blue-600 text-white">
                    Step {currentStep.number}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentStep.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline: {currentStep.estimatedWeeks}</span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Milestone Objective
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                {currentStep.summary}
              </p>
            </div>

            {/* Key Deliverables */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Action Items & Deliverables
              </h4>
              <div className="space-y-2">
                {currentStep.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        currentStep.status === "completed"
                          ? "text-emerald-500"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="leading-snug">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Criteria */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Completion & Verification Benchmark
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/70 dark:border-amber-800/50">
                🎯 {currentStep.completionCriteria}
              </p>
            </div>

            {/* Suggested Tech Stack */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Recommended Tooling & Frameworks
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentStep.suggestedTech.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Sprint 11 Roadmap Framework • Sprint 12 will connect active user synchronization
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
