"use client";

import React, { useState } from "react";
import { InterviewFeedbackArtifactData } from "@/types/agent";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles, HelpCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface InterviewFeedbackCardProps {
  data: InterviewFeedbackArtifactData;
  onContinue?: () => void;
}

export default function InterviewFeedbackCard({
  data,
  onContinue,
}: InterviewFeedbackCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!data || typeof data !== "object") {
    return null;
  }

  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const improvements = Array.isArray(data.improvements) ? data.improvements : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-sm space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Answer Evaluation & Feedback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Qualitative AI assessment of your interview response
            </p>
          </div>
        </div>
      </div>

      {/* Question & Answer Accordion / Preview */}
      {(data.question || data.answer) && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          {data.question && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Question Evaluated
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.question}
              </p>
            </div>
          )}

          {data.answer && (
            <div>
              <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
              >
                <span>{showOriginal ? "Hide your submitted answer" : "View your submitted answer"}</span>
                {showOriginal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showOriginal && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {data.answer}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4 Dimension Qualitative Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Clarity", val: data.clarity },
          { label: "Structure", val: data.structure },
          { label: "Specificity", val: data.specificity },
          { label: "Technical Depth", val: data.technical_depth },
        ].map(
          (dim, idx) =>
            dim.val && (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70"
              >
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {dim.label}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 capitalize">
                  {dim.val}
                </div>
              </div>
            )
        )}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Key Strengths
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

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Areas to Improve
            </h4>
            <ul className="space-y-1.5 pl-1">
              {improvements.map((imp, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed flex items-start gap-1.5"
                >
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Answer Direction */}
      {data.suggested_answer_direction && (
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 space-y-1.5">
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Recommended Answer Framing (STAR Strategy)
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-1">
            {data.suggested_answer_direction}
          </p>
        </div>
      )}

      {/* Continue Button */}
      {onContinue && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Continue Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
