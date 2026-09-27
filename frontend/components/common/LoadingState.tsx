import { cn } from "@/lib/utils";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export default function LoadingState({ rows = 3, className = "" }: LoadingStateProps) {
  return (
    <div className={cn("space-y-3 animate-pulse p-4", className)}>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-full border border-slate-200/50 dark:border-slate-800/50"
        />
      ))}
    </div>
  );
}
