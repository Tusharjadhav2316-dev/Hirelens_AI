"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Video, Briefcase, GraduationCap, ArrowRight } from "lucide-react";

export default function RecommendedCard() {
  const recommendations = [
    {
      id: 1,
      title: "Improve Your Resume",
      description: "Optimize for better ATS compatibility and keyword density.",
      icon: ShieldCheck,
      href: "/dashboard/resume-analyzer",
      badge: "ATS Score",
      badgeColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      id: 2,
      title: "Practice Mock Interview",
      description: "Practice role-specific questions with AI live feedback.",
      icon: Video,
      href: "/dashboard/interview-trainer",
      badge: "Interview",
      badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      id: 3,
      title: "Explore Matching Jobs",
      description: "Discover curated job opportunities matching your skills.",
      icon: Briefcase,
      href: "/dashboard/job-matcher",
      badge: "Job Match",
      badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      id: 4,
      title: "Career Roadmap Coaching",
      description: "Explore career roadmaps and salary benchmarks.",
      icon: GraduationCap,
      href: "/dashboard/career-coach",
      badge: "Coaching",
      badgeColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl p-5 bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Recommended for You
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Curated actions to accelerate your career progress
        </p>
      </div>

      <div className="flex-1 space-y-2.5">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <Link
              key={rec.id}
              href={rec.href}
              className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rec.title}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${rec.badgeColor}`}>
                    {rec.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {rec.description}
                </p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 self-center" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
