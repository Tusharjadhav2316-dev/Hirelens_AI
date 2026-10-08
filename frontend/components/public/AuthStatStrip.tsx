import { cn } from "@/lib/utils";

interface AuthStatStripProps {
  growthLabel?: string;
  className?: string;
}

export default function AuthStatStrip({
  growthLabel = "Report Career Growth",
  className = "",
}: AuthStatStripProps) {
  const stats = [
    {
      value: "500K+",
      label: "Students & Professionals",
    },
    {
      value: "4.8/5",
      label: "Average Rating",
    },
    {
      value: "95%",
      label: growthLabel,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80",
        className
      )}
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {stat.value}
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
