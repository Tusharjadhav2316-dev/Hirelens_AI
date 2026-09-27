"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Play, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WatchDemoModal({ isOpen, onClose }: WatchDemoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-demo-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Play className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" />
            </div>
            <div>
              <h2
                id="watch-demo-title"
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-white"
              >
                HireLens AI Product Demo
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close demo modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Visual Poster Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-6 sm:p-8 text-center text-white overflow-hidden shadow-inner">
            {/* Background glowing orbs */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-white shadow-lg">
                <Play className="w-7 h-7 ml-1 fill-white" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> High-Definition Walkthrough Coming Soon
              </span>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                We are finishing an updated, narrated walkthrough highlighting how HireLens AI analyzes resumes, runs mock interviews, and discovers matching roles.
              </p>
            </div>
          </div>

          {/* Key Capabilities Preview */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              What you can experience immediately:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>AI ATS Score & Keyword Gap Analyzer</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Interactive AI Mock Interview Trainer</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Tailored AI Cover Letter Generator</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Curated Job Match & Application Tracking</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <Link
              href="/signup"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
