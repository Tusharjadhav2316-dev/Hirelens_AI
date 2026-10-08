"use client";

import React from "react";
import AuthHeader from "@/components/public/AuthHeader";
import AuthStatStrip from "@/components/public/AuthStatStrip";
import ScriptAccent from "@/components/common/ScriptAccent";
import IconTile from "@/components/common/IconTile";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BenefitItem {
  icon: LucideIcon;
  variant: "blue" | "violet" | "emerald" | "amber" | "indigo" | "rose" | "teal" | "slate";
  title: string;
  description: string;
}

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  headerRightAction?: "backToHome" | "signInPrompt" | "signUpPrompt";
  title: string;
  accentWord: string;
  subtitle: string;
  benefits: BenefitItem[];
  marketingCollage?: React.ReactNode;
  statGrowthLabel?: string;
  className?: string;
}

export default function AuthSplitLayout({
  children,
  headerRightAction = "backToHome",
  title,
  accentWord,
  subtitle,
  benefits,
  marketingCollage,
  statGrowthLabel = "Report Career Growth",
  className = "",
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white",
        className
      )}
    >
      {/* 1. Translucent Top Navigation Bar */}
      <AuthHeader rightAction={headerRightAction} />

      {/* 2. Main Two-Column Split Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start justify-center">
        {/* Left Marketing Region (Visible on lg+) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 pt-1">
          {/* Eyebrow & H1 Header */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 block">
              AI-POWERED CAREER OPERATING SYSTEM
            </span>

            <h1 className="text-3xl lg:text-[40px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {title.split(accentWord)[0]}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                {accentWord}
              </span>
              {title.split(accentWord)[1] || ""}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* TWO SEPARATE NON-OVERLAPPING VISUAL COLUMNS */}
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* COLUMN A: 4 Feature Stack */}
            <div className="col-span-5 space-y-2.5">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <IconTile
                    icon={b.icon}
                    variant={b.variant}
                    size="sm"
                    className="shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                      {b.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Script Accent strictly underneath Column A */}
              <div className="pt-2 pl-0.5">
                <ScriptAccent
                  text="Same You. Bigger Opportunities."
                  rotation="-rotate-3"
                  className="text-slate-500 dark:text-slate-400 text-xs font-medium"
                />
              </div>
            </div>

            {/* COLUMN B: Product Visual (Completely Separate, 0 Overlap) */}
            <div className="col-span-7">
              {marketingCollage}
            </div>
          </div>

          {/* Bottom 3-Stat Metric Strip */}
          <AuthStatStrip growthLabel={statGrowthLabel} />
        </div>

        {/* Right Column: Centered Elevated Auth Form Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-[420px] space-y-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
