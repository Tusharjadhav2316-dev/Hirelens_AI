import React from "react";
import { Settings } from "lucide-react";
import IconTile from "@/components/common/IconTile";
import ScriptAccent from "@/components/common/ScriptAccent";

export default function ProfileSettingsHeader() {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start gap-4">
        <IconTile icon={Settings} variant="violet" size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Profile </span>
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
                Settings
              </span>
            </h1>
            <div className="hidden lg:block ml-2">
              <ScriptAccent
                text="Keep your profile updated for better opportunities."
                showFlourish={false}
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage your personal information, career identity, and profile preferences across HireLens.
          </p>
        </div>
      </div>
    </div>
  );
}
