"use client";

import React from "react";
import { InterviewReportArtifactData } from "@/types/agent";
import { Award, CheckCircle2, TrendingUp, BookOpen, AlertCircle, RefreshCw, FileText, Sparkles, ShieldCheck } from "lucide-react";

interface InterviewReportCardProps {
  data: InterviewReportArtifactData;
  onPracticeAgain?: () => void;
  onImproveResume?: () => void;
}

export default function InterviewReportCard({
  data,
  onPracticeAgain,
  onImproveResume,
}: InterviewReportCardProps) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const readinessEntries = Object.entries(data.readiness_by_category || {});
  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const improvementAreas = Array.isArray(data.improvement_areas) ? data.improvement_areas : [];
  const priorityTopics = Array.isArray(data.priority_topics) ? data.priority_topics : [];

  const getReadinessStyle = (level: string) => {
    switch (level) {
      case "Strong":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          border: "border-emerald-200 dark:border-emerald-800",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
        };
      case "Moderate":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          border: "border-amber-200 dark:border-amber-800",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
        };
      case "Needs Improvement":
      default:
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          border: "border-rose-200 dark:border-rose-800",
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-md space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mock Interview Readiness Report
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Qualitative synthesis of candidate performance and domain readiness
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
          Completed Session
        </span>
      </div>

      {/* Session Metadata Summary */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
            Target Role
          </span>
          <p className="font-bold text-slate-900 dark:text-white truncate">
            {data.target_role || "Software Engineer"}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
            Interview Mode
          </span>
          <p className="font-bold text-slate-900 dark:text-white capitalize">
            {data.interview_type || "Mixed"}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
            Questions Evaluated
          </span>
          <p className="font-bold text-slate-900 dark:text-white">
            {data.questions_asked || 0} Questions
          </p>
        </div>
      </div>

      {/* Category Readiness Breakdown */}
      {readinessEntries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Category Readiness
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {readinessEntries.map(([category, level]) => {
              const style = getReadinessStyle(level);
              return (
                <div
                  key={category}
                  className={`p-3 rounded-xl border ${style.bg} ${style.border} flex items-center justify-between shadow-2xs`}
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${style.badge}`}
                  >
                    {level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Strengths */}
        {strengths.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Observed Strengths
            </h4>
            <ul className="space-y-1.5 pl-1">
              {strengths.map((str, idx) => (
                <li
                  key={idx}
                  className="text-xs text-emerald-950 dark:text-emerald-200/90 leading-relaxed flex items-start gap-1.5"
                >
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Opportunities */}
        {improvementAreas.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Targeted Improvement Areas
            </h4>
            <ul className="space-y-1.5 pl-1">
              {improvementAreas.map((area, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed flex items-start gap-1.5"
                >
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Priority Preparation Topics */}
      {priorityTopics.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 space-y-2">
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Recommended Practice Topics
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {priorityTopics.map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Note / Ethical Disclaimer */}
      {data.note && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{data.note}</p>
        </div>
      )}

      {/* Action Affordances */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        {onPracticeAgain && (
          <button
            type="button"
            onClick={onPracticeAgain}
            className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Practice Another Interview
          </button>
        )}

        {onImproveResume && (
          <button
            type="button"
            onClick={onImproveResume}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Align Resume with Feedback
          </button>
        )}
      </div>
    </div>
  );
}
