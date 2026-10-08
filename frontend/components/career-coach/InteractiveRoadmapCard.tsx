import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  CircleDot,
  Circle,
  ArrowRight,
  Target,
  Clock,
} from "lucide-react";
import { CareerRoadmap, RoadmapStep } from "./CareerCoachTypes";

interface InteractiveRoadmapCardProps {
  roadmap: CareerRoadmap;
  onViewDetails: () => void;
  onSelectStep?: (step: RoadmapStep) => void;
}

export default function InteractiveRoadmapCard({
  roadmap,
  onViewDetails,
  onSelectStep,
}: InteractiveRoadmapCardProps) {
  // Always start at Step 1 (first step of the roadmap)
  const [selectedStepId, setSelectedStepId] = useState<number>(
    roadmap.steps[0]?.id || 1
  );

  // When roadmap changes (topic switched), always reset selection to Step 1
  useEffect(() => {
    if (roadmap.steps[0]) {
      setSelectedStepId(roadmap.steps[0].id);
    }
  }, [roadmap.id]);

  const activeStep =
    roadmap.steps.find((s) => s.id === selectedStepId) ||
    roadmap.steps[0];

  const handleStepClick = (step: RoadmapStep) => {
    setSelectedStepId(step.id);
    if (onSelectStep) {
      onSelectStep(step);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 transition-all">
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {roadmap.roleTitle}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Step 1 of 6
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              6-stage progression • {roadmap.level}
            </p>
          </div>
        </div>

        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition cursor-pointer self-start sm:self-center"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6-Step Horizontal Progress Bar Tracker (Desktop clean wide fit) */}
      <div className="py-5 overflow-x-auto custom-scrollbar">
        <div className="min-w-[620px] flex items-center justify-between relative px-2">
          {/* Connecting Background Line */}
          <div className="absolute left-8 right-8 top-5 h-1 bg-slate-200 dark:bg-slate-800 -z-0 rounded-full" />
          {/* Active Segment Marker */}
          <div className="absolute left-8 w-[8%] top-5 h-1 bg-blue-600 dark:bg-blue-500 -z-0 rounded-full" />

          {roadmap.steps.map((step, idx) => {
            const isSelected = step.id === selectedStepId;
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current" || idx === 0;
            const isNext = idx === 1;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step)}
                className="relative z-10 flex flex-col items-center group cursor-pointer text-center max-w-[100px]"
              >
                {/* Step Node Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-md shadow-blue-500/30"
                      : isNext
                      ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-650 group-hover:border-blue-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-750 group-hover:border-slate-400"
                  } ${isSelected ? "scale-110 ring-2 ring-indigo-400 dark:ring-indigo-500" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <CircleDot className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-bold">{step.number}</span>
                  )}
                </div>

                {/* Step Title Label */}
                <span
                  className={`mt-2 text-[11px] font-semibold leading-tight transition-colors line-clamp-2 ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : isCompleted
                      ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                      : isCurrent
                      ? "text-slate-900 dark:text-white font-bold"
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                  }`}
                >
                  {step.title}
                </span>

                {/* Status indicator tag */}
                <span
                  className={`text-[9px] font-medium mt-0.5 uppercase tracking-wider ${
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : isCurrent
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : isNext
                      ? "text-slate-500 dark:text-slate-400 font-semibold"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isCompleted ? "Done" : isCurrent ? "Active" : isNext ? "Next" : "Upcoming"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail Panel */}
      {activeStep && (
        <div className="mt-2 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-600 text-white">
                Step {activeStep.number}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {activeStep.title}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  activeStep.status === "completed"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                    : activeStep.status === "current" || activeStep.id === 1
                    ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                    : "bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60"
                }`}
              >
                {activeStep.status === "completed"
                  ? "Completed"
                  : activeStep.status === "current" || activeStep.id === 1
                  ? "Currently In Progress"
                  : activeStep.id === 2
                  ? "Next Milestone"
                  : "Upcoming Milestone"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeStep.estimatedWeeks}</span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {activeStep.summary}
          </p>

          {/* Deliverables / Checklist Cards (DARK MODE COMPLIANT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {activeStep.deliverables.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    activeStep.status === "completed"
                      ? "text-emerald-500"
                      : "text-blue-500"
                  }`}
                />
                <span className="text-[11px] leading-snug">{item}</span>
              </div>
            ))}
          </div>

          {/* Suggested Tooling Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-750">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
              Focus Areas:
            </span>
            {activeStep.suggestedTech.map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
