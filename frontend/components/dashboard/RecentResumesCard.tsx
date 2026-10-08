"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, MoreVertical, PlusCircle } from "lucide-react";
import { ActivityHistoryItem } from "@/lib/historyService";

interface RecentResumesCardProps {
  items: ActivityHistoryItem[];
  loading?: boolean;
}

export default function RecentResumesCard({ items, loading = false }: RecentResumesCardProps) {
  // Filter for resume and ats-analysis types
  const resumeItems = items.filter(
    (item) => item.type === "resume" || item.type === "ats-analysis"
  ).slice(0, 4);

  const formatTimestamp = (createdAt: any) => {
    if (!createdAt) return "Recently";
    try {
      if (createdAt.toDate) {
        const d = createdAt.toDate();
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      if (typeof createdAt === "number" || typeof createdAt === "string") {
        const d = new Date(createdAt);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      return "Recently";
    }
    return "Recently";
  };

  return (
    <div className="flex flex-col h-full rounded-2xl p-5 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Resumes
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Your saved and analyzed resumes
          </p>
        </div>
        <Link
          href="/dashboard/history"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 space-y-2.5">
        {loading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : resumeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 my-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              No resumes yet
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
              Create or upload your first resume to see real ATS scores here.
            </p>
            <Link
              href="/dashboard/builder"
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Resume
            </Link>
          </div>
        ) : (
          resumeItems.map((item) => {
            const score = item.metadata?.score;
            return (
              <Link
                key={item.id}
                href="/dashboard/builder"
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title || "Untitled Resume"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Updated {formatTimestamp(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {typeof score === "number" && (
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      {score} ATS
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                    title="Options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
