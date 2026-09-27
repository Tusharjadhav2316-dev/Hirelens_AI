import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type TagVariant = "matched" | "missing" | "suggested" | "neutral" | "brand";

interface KeywordTagProps {
  label: string;
  variant?: TagVariant;
  onRemove?: () => void;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<TagVariant, string> = {
  matched:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80",
  missing:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80",
  suggested:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  brand:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80",
};

export default function KeywordTag({
  label,
  variant = "neutral",
  onRemove,
  count,
  className = "",
  size = "md",
}: KeywordTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs transition-all",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="opacity-75 font-semibold">({count})</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none ml-0.5"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
