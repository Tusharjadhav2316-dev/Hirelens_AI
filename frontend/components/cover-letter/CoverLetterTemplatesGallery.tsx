import React from "react";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
import { CoverLetterTemplateId, COVER_LETTER_TEMPLATES } from "./CoverLetterTypes";

interface CoverLetterTemplatesGalleryProps {
  selectedTemplateId: CoverLetterTemplateId;
  onSelectTemplate: (id: CoverLetterTemplateId) => void;
}

export default function CoverLetterTemplatesGallery({
  selectedTemplateId,
  onSelectTemplate,
}: CoverLetterTemplatesGalleryProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Cover Letter Templates
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          4 styles available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COVER_LETTER_TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-500/40"
                  : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {tpl.badge}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {isSelected ? "Currently Active" : "Click to Apply"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
