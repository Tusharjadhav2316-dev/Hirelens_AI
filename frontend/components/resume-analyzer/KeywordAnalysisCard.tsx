"use client";

import { useState } from "react";
import KeywordTag from "@/components/common/KeywordTag";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface KeywordAnalysisCardProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
}

export default function KeywordAnalysisCard({
  matchedKeywords = [],
  missingKeywords = [],
  suggestedKeywords = [],
}: KeywordAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<"all" | "matched" | "missing" | "suggested">("all");

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keyword Analysis</h3>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 mb-3.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold text-[11px] transition-all ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          All ({matchedKeywords.length + missingKeywords.length + suggestedKeywords.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("matched")}
          className={`py-1 px-2.5 rounded-lg font-semibold text-[11px] transition-all ${
            activeTab === "matched"
              ? "bg-emerald-500 text-white shadow-2xs"
              : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          }`}
        >
          Matched [{matchedKeywords.length}]
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("missing")}
          className={`py-1 px-2.5 rounded-lg font-semibold text-[11px] transition-all ${
            activeTab === "missing"
              ? "bg-red-500 text-white shadow-2xs"
              : "text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
          }`}
        >
          Missing [{missingKeywords.length}]
        </button>
        {suggestedKeywords.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("suggested")}
            className={`py-1 px-2 rounded-lg font-semibold text-[11px] transition-all ${
              activeTab === "suggested"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            Suggested [{suggestedKeywords.length}]
          </button>
        )}
      </div>

      {/* Keyword Cloud Container */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1 custom-scrollbar">
        {/* Matched Section */}
        {(activeTab === "all" || activeTab === "matched") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords ({matchedKeywords.length})
              </span>
            </div>
            {matchedKeywords.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No matching keywords found.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map((kw, i) => (
                  <KeywordTag key={`matched-${i}`} label={kw} variant="matched" size="sm" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Missing Section */}
        {(activeTab === "all" || activeTab === "missing") && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords ({missingKeywords.length})
              </span>
            </div>
            {missingKeywords.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No critical missing keywords!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((kw, i) => (
                  <KeywordTag key={`missing-${i}`} label={kw} variant="missing" size="sm" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Section */}
        {(activeTab === "all" || activeTab === "suggested") && suggestedKeywords.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Suggested Additions ({suggestedKeywords.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedKeywords.map((kw, i) => (
                <KeywordTag key={`suggested-${i}`} label={kw} variant="suggested" size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
