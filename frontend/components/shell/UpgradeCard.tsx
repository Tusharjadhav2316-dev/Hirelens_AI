"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function UpgradeCard() {
  const handleUpgradeClick = () => {
    toast.info("Pro plans and subscriptions are coming soon in Sprint 12!");
  };

  return (
    <div className="mx-3 my-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-violet-50/50 to-purple-50/80 dark:from-indigo-950/40 dark:via-violet-950/20 dark:to-purple-950/40 border border-indigo-100/80 dark:border-indigo-900/50 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Upgrade to Pro
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
        Get unlimited AI features, more templates and advanced insights.
      </p>
      <button
        onClick={handleUpgradeClick}
        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium shadow-xs shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
      >
        <span>Upgrade Now</span>
        <span className="text-xs">→</span>
      </button>
    </div>
  );
}
