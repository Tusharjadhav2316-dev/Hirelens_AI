import React from "react";
import { FileText, ShieldCheck, Eye, Download } from "lucide-react";
import IconTile from "@/components/common/IconTile";

interface HistoryMetricsRowProps {
  totalResumes: number;
  atsOptimizedCount: number;
  totalViews?: number;
  totalDownloads?: number;
}

export default function HistoryMetricsRow({
  totalResumes,
  atsOptimizedCount,
  totalViews = 312,
  totalDownloads = 28,
}: HistoryMetricsRowProps) {
  const stats = [
    {
      label: "Total Resumes",
      value: totalResumes,
      subtext: "Saved versions & drafts",
      icon: FileText,
      variant: "blue" as const,
    },
    {
      label: "ATS Optimized",
      value: atsOptimizedCount,
      subtext: "Score 80+ benchmark",
      icon: ShieldCheck,
      variant: "violet" as const,
    },
    {
      label: "Total Views",
      value: totalViews,
      subtext: "Recruiter & link views",
      icon: Eye,
      variant: "indigo" as const,
    },
    {
      label: "Total Downloads",
      value: totalDownloads,
      subtext: "PDF & DOCX exports",
      icon: Download,
      variant: "emerald" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4 transition hover:border-slate-300 dark:hover:border-slate-700/80"
        >
          <IconTile icon={stat.icon} variant={stat.variant} size="md" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              {stat.value}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">
              {stat.label}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
              {stat.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
