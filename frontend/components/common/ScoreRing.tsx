import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  delta?: string;
  showPercent?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 48, stroke: 4, text: "text-sm font-bold", sub: "text-[9px]" },
  md: { width: 72, stroke: 6, text: "text-lg font-bold", sub: "text-[10px]" },
  lg: { width: 104, stroke: 8, text: "text-2xl font-bold", sub: "text-xs" },
  xl: { width: 132, stroke: 10, text: "text-3xl font-extrabold", sub: "text-xs" },
};

export default function ScoreRing({
  score,
  maxScore = 100,
  size = "md",
  label,
  delta,
  showPercent = false,
  className = "",
}: ScoreRingProps) {
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalizedScore / maxScore) * 100;

  const cfg = sizeConfig[size];
  const radius = (cfg.width - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 stroke-emerald-500";
    if (val >= 60) return "text-amber-500 stroke-amber-500";
    return "text-red-500 stroke-red-500";
  };

  const getPillBg = (val: number) => {
    if (val >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    if (val >= 60) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: cfg.width, height: cfg.width }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${cfg.width} ${cfg.width}`}>
          {/* Background Ring */}
          <circle
            cx={cfg.width / 2}
            cy={cfg.width / 2}
            r={radius}
            strokeWidth={cfg.stroke}
            className="stroke-slate-100 dark:stroke-slate-800"
            fill="none"
          />
          {/* Progress Ring */}
          <circle
            cx={cfg.width / 2}
            cy={cfg.width / 2}
            r={radius}
            strokeWidth={cfg.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-out", getScoreColor(percentage))}
            fill="none"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn("leading-none text-slate-900 dark:text-white", cfg.text)}>
            {score}
            {showPercent && <span className={cfg.sub}>%</span>}
          </span>
          {maxScore === 100 && !showPercent && (
            <span className={cn("text-slate-400 dark:text-slate-500 font-medium leading-tight", cfg.sub)}>
              /100
            </span>
          )}
        </div>
      </div>

      {/* Optional Label or Status Pill */}
      {label && (
        <span
          className={cn(
            "mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs",
            getPillBg(percentage)
          )}
        >
          {label}
        </span>
      )}

      {/* Delta indicator */}
      {delta && (
        <span className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
          {delta}
        </span>
      )}
    </div>
  );
}
