import { UserCheck, Sparkles, KeyRound, ArrowRight } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import { cn } from "@/lib/utils";

interface AuthProcessTimelineProps {
  className?: string;
}

export default function AuthProcessTimeline({ className = "" }: AuthProcessTimelineProps) {
  const steps = [
    {
      icon: UserCheck,
      variant: "blue" as const,
      title: "Create Your Profile",
    },
    {
      icon: Sparkles,
      variant: "violet" as const,
      title: "Get AI Insights",
    },
    {
      icon: KeyRound,
      variant: "teal" as const,
      title: "Unlock Opportunities",
    },
  ];

  return (
    <div className={cn("pt-4 space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-1 last:flex-initial">
            {/* Step Item */}
            <div className="flex items-center gap-2">
              <IconTile
                icon={step.icon}
                variant={step.variant}
                size="sm"
                className="shrink-0"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {step.title}
              </span>
            </div>

            {/* Dotted Connector Arrow (between items) */}
            {idx < steps.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-1">
                <div className="w-full border-t-2 border-dotted border-slate-300 dark:border-slate-700 relative">
                  <ArrowRight className="w-3 h-3 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 -translate-x-0.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
