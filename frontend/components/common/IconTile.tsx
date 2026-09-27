import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeatureVariant =
  | "indigo"
  | "blue"
  | "violet"
  | "emerald"
  | "rose"
  | "amber"
  | "teal"
  | "slate";

interface IconTileProps {
  icon: LucideIcon;
  variant?: FeatureVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<FeatureVariant, { bg: string; text: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60",
    text: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900/60",
    text: "text-violet-600 dark:text-violet-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60",
    text: "text-rose-600 dark:text-rose-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60",
    text: "text-amber-600 dark:text-amber-400",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60",
    text: "text-teal-600 dark:text-teal-400",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
  },
};

const sizeStyles = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-11 h-11 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export default function IconTile({
  icon: Icon,
  variant = "indigo",
  size = "md",
  className = "",
}: IconTileProps) {
  const styles = variantStyles[variant] || variantStyles.indigo;

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0 shadow-2xs",
        sizeStyles[size],
        styles.bg,
        className
      )}
    >
      <Icon className={cn(iconSizes[size], styles.text)} />
    </div>
  );
}
