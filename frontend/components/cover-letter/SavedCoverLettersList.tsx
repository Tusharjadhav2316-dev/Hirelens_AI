import React from "react";
import { Sparkles, Calendar, Building2, ArrowRight, Trash2, FileText, Clock } from "lucide-react";
import { SavedCoverLetterRecord } from "./CoverLetterTypes";

interface SavedCoverLettersListProps {
  savedLetters: SavedCoverLetterRecord[];
  onSelectLetter: (letter: SavedCoverLetterRecord) => void;
  onDeleteLetter: (id: string) => void;
  onCreateNew: () => void;
}

export default function SavedCoverLettersList({
  savedLetters,
  onSelectLetter,
  onDeleteLetter,
  onCreateNew,
}: SavedCoverLettersListProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Saved Cover Letters
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {savedLetters.length} {savedLetters.length === 1 ? "letter" : "letters"} saved
        </span>
      </div>

      {savedLetters.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No saved cover letters yet
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Generate a cover letter in the &quot;Create New&quot; tab and it will be automatically saved to your history.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
          >
            <span>Create New Cover Letter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {savedLetters.map((letter) => (
            <div
              key={letter.id}
              className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between gap-3"
            >
              <div
                onClick={() => onSelectLetter(letter)}
                className="space-y-1 min-w-0 flex-1 cursor-pointer"
              >
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {letter.title || `Cover Letter — ${letter.company}`}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {letter.company}
                  </span>
                  <span>•</span>
                  <span>{letter.jobTitle}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {letter.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectLetter(letter)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition cursor-pointer"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLetter(letter.id)}
                  aria-label="Delete saved letter"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
