import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string | number;
  title: string;
  subtitle?: string;
  status: "completed" | "current" | "upcoming";
}

interface StepTrackerProps {
  steps: StepItem[];
  className?: string;
}

export default function StepTracker({ steps, className = "" }: StepTrackerProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center w-full gap-2 sm:gap-0", className)}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="flex-1 flex items-center w-full">
            <div className="flex items-center gap-3">
              {/* Node Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all shadow-2xs",
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>

              {/* Labels */}
              <div className="text-left">
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isCurrent || isCompleted
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "hidden sm:block flex-1 h-0.5 mx-3 rounded-full transition-all",
                  isCompleted
                    ? "bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
