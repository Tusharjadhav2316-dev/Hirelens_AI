import React from "react";
import { MessageSquare, Wand2, Loader2, Sparkles, ChevronRight } from "lucide-react";

interface AdditionalInfoSectionProps {
  additionalInfo: string;
  onAdditionalInfoChange: (val: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  disabled: boolean;
}

export default function AdditionalInfoSection({
  additionalInfo,
  onAdditionalInfoChange,
  tone,
  onToneChange,
  isLoading,
  onGenerate,
  disabled,
}: AdditionalInfoSectionProps) {
  const charCount = additionalInfo.length;
  const maxChars = 500;

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
          3
        </div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Additional Information (Optional)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tone Selector */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Writing Tone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "Professional and Confident", label: "Professional & Confident" },
              { id: "Enthusiastic and Passionate", label: "Enthusiastic & Passionate" },
              { id: "Direct and Minimal", label: "Direct & Minimal" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onToneChange(t.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  tone === t.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Textarea */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Special Focus / Custom Guidance</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {charCount} / {maxChars}
            </span>
          </div>
          <textarea
            value={additionalInfo}
            onChange={(e) => onAdditionalInfoChange(e.target.value.slice(0, maxChars))}
            rows={2}
            placeholder="e.g. Emphasize full-stack React/Node architecture and mention relocation readiness..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating Tailored Cover Letter...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Cover Letter</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
