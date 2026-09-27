import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroInspirationalCardProps {
  className?: string;
}

export default function HeroInspirationalCard({ className = "" }: HeroInspirationalCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-lg max-w-[260px] sm:max-w-[290px] select-none pointer-events-none transition-all",
        className
      )}
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
        <Sparkles className="w-4 h-4 fill-white" />
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
        Your next chapter is closer than you think.
      </p>
    </div>
  );
}
