"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, FileText, Send, Video, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerJourneyProps {
  hasResume: boolean;
  interviewCount: number;
}

export default function CareerJourney({ hasResume, interviewCount }: CareerJourneyProps) {
  const steps = [
    {
      id: 1,
      title: "Resume Built",
      description: hasResume ? "ATS ready & optimized" : "Create your first resume",
      icon: FileText,
      status: hasResume ? "completed" : "in_progress",
      href: "/dashboard/builder",
    },
    {
      id: 2,
      title: "Job Applications",
      description: "Search & match open roles",
      icon: Send,
      status: "pending",
      href: "/dashboard/job-matcher",
    },
    {
      id: 3,
      title: "Mock Interviews",
      description: interviewCount > 0 ? `${interviewCount} sessions completed` : "AI mock practice",
      icon: Video,
      status: interviewCount > 0 ? "completed" : "pending",
      href: "/dashboard/interview-trainer",
    },
    {
      id: 4,
      title: "Dream Job Offer",
      description: "Career milestone",
      icon: Sparkles,
      status: "pending",
      href: "/dashboard/career-coach",
    },
  ];

  return (
    <div className="relative rounded-2xl p-5 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Your Career Journey
            </h3>
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              {hasResume ? "Step 2 Next" : "Step 1 In Progress"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Follow the guided path from resume optimization to landing offers
          </p>
        </div>

        <Link
          href={hasResume ? "/dashboard/job-matcher" : "/dashboard/builder"}
          className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          {hasResume ? "Explore Jobs" : "Start Resume"}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* 4 Steps Track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in_progress";
          const Icon = step.icon;

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "group relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-150",
                isCompleted
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-300"
                  : isInProgress
                  ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40 hover:border-indigo-300"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 hover:border-slate-300"
              )}
            >
              {/* Step indicator circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-transform group-hover:scale-105",
                  isCompleted
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20"
                    : isInProgress
                    ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {step.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
