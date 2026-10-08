import React from "react";
import { ClipboardList, ArrowRight, CheckCircle2, Clock, Calendar, Trophy, XCircle } from "lucide-react";
import { ApplicationRecord, ApplicationStatus } from "./JobTypes";

interface ApplicationTrackerCardProps {
  applications: ApplicationRecord[];
  onOpenTrackerDrawer: () => void;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  Applied: {
    label: "Applied",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: Clock,
  },
  "Under Review": {
    label: "Under Review",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  Interview: {
    label: "Interview",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    icon: Calendar,
  },
  Offer: {
    label: "Offer",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Trophy,
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-slate-50 dark:bg-slate-900",
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
    icon: XCircle,
  },
};

export default function ApplicationTrackerCard({
  applications,
  onOpenTrackerDrawer,
}: ApplicationTrackerCardProps) {
  const counts = (["Applied", "Under Review", "Interview", "Offer", "Rejected"] as ApplicationStatus[]).reduce(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status).length;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  const total = applications.length;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application Tracker</h3>
            <p className="text-[11px] text-slate-400">
              {total} {total === 1 ? "application" : "applications"} active
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTrackerDrawer}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 5 Status Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {(["Applied", "Under Review", "Interview", "Offer", "Rejected"] as ApplicationStatus[]).map(
          (status) => {
            const cfg = statusConfig[status];
            const count = counts[status];
            return (
              <div
                key={status}
                onClick={onOpenTrackerDrawer}
                className={`p-2.5 rounded-xl border ${cfg.border} ${cfg.bg} cursor-pointer hover:opacity-90 transition`}
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                  {cfg.label}
                </span>
                <span className={`text-base font-extrabold ${cfg.text}`}>
                  {count}
                </span>
              </div>
            );
          }
        )}
      </div>

      {total === 0 ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-1">
          No applications tracked yet. Click "Track Applications" to log one.
        </p>
      ) : (
        <div className="pt-2">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(counts["Applied"] / total) * 100}%` }}
              className="bg-blue-500 h-full"
            />
            <div
              style={{ width: `${(counts["Under Review"] / total) * 100}%` }}
              className="bg-amber-500 h-full"
            />
            <div
              style={{ width: `${(counts["Interview"] / total) * 100}%` }}
              className="bg-purple-500 h-full"
            />
            <div
              style={{ width: `${(counts["Offer"] / total) * 100}%` }}
              className="bg-emerald-500 h-full"
            />
            <div
              style={{ width: `${(counts["Rejected"] / total) * 100}%` }}
              className="bg-slate-400 h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
