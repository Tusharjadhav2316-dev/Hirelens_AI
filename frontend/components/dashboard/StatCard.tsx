"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeVariant?: "success" | "neutral" | "muted" | "brand";
  caption: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  subValue,
  badgeText,
  badgeVariant = "neutral",
  caption,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  const getBadgeClasses = () => {
    switch (badgeVariant) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
      case "brand":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40";
      case "muted":
        return "bg-slate-100 text-slate-500 border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/40";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/40";
    }
  };

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-4.5 h-4.5", iconColor)} />
        </div>
      </div>

      <div className="space-y-1 my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {subValue && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {subValue}
            </span>
          )}
        </div>

        {badgeText && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                getBadgeClasses()
              )}
            >
              {badgeText}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
        {caption}
      </p>
    </div>
  );
}
