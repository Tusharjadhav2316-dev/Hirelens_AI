import { Sparkles } from "lucide-react";
import ScriptAccent from "./ScriptAccent";
import { cn } from "@/lib/utils";

interface PromoBandProps {
  headline: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  scriptText?: string;
  className?: string;
}

export default function PromoBand({
  headline,
  description,
  buttonText,
  onButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  scriptText,
  className = "",
}: PromoBandProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-purple-950/40 border border-blue-100/80 dark:border-blue-900/50 shadow-xs",
        className
      )}
    >
      {/* Left: Icon + Content */}
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
          <Sparkles className="w-5 h-5 fill-white" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {headline}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Right: Actions + Script Accent */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
        <button
          onClick={onButtonClick}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 flex-shrink-0"
        >
          <span>{buttonText}</span>
          <span>→</span>
        </button>

        {secondaryButtonText && (
          <button
            onClick={onSecondaryButtonClick}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] flex-shrink-0"
          >
            <span>{secondaryButtonText}</span>
          </button>
        )}

        {scriptText && (
          <div className="hidden xl:block pl-2">
            <ScriptAccent text={scriptText} showFlourish={true} />
          </div>
        )}
      </div>
    </div>
  );
}
