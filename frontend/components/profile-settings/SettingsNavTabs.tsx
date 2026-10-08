import React from "react";
import { User, Shield, Sliders, Bell, CreditCard } from "lucide-react";

export type SettingsTabId =
  | "personal-info"
  | "account-security"
  | "preferences"
  | "notifications"
  | "subscription";

interface SettingsNavTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export default function SettingsNavTabs({
  activeTab,
  onTabChange,
}: SettingsNavTabsProps) {
  const tabs: { id: SettingsTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "personal-info", label: "Personal Info", icon: User },
    { id: "account-security", label: "Account & Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "subscription", label: "Subscription", icon: CreditCard },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 custom-scrollbar">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-shrink-0 border ${
              isSelected
                ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
