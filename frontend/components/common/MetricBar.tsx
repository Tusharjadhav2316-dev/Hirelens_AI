import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  value: number; // 0 to 100
  color?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "violet";
  className?: string;
  showPercent?: boolean;
}

const colorMap = {
  indigo: "bg-indigo-600 dark:bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  blue: "bg-blue-600",
  violet: "bg-violet-600",
};

export default function MetricBar({
  label,
  value,
  color = "indigo",
  className = "",
  showPercent = true,
}: MetricBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        {showPercent && (
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {normalizedValue}%
          </span>
        )}
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorMap[color])}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
