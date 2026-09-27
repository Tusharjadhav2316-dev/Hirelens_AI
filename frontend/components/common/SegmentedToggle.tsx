"use client";

import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedToggleProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export default function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 font-semibold transition-all rounded-lg",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm",
              isSelected
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {opt.icon && <span className="opacity-80">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
