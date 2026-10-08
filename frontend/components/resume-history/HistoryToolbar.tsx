import React from "react";
import { Search, SlidersHorizontal, Star, ShieldCheck, FileText, Sparkles, X } from "lucide-react";
import { HistoryFilterTab, HistorySortOption } from "./HistoryTypes";

interface HistoryToolbarProps {
  activeTab: HistoryFilterTab;
  onTabChange: (tab: HistoryFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: HistorySortOption;
  onSortChange: (sort: HistorySortOption) => void;
  templateFilter: string;
  onTemplateFilterChange: (template: string) => void;
  counts: {
    all: number;
    atsOptimized: number;
    customTemplates: number;
    starred: number;
  };
}

export default function HistoryToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  templateFilter,
  onTemplateFilterChange,
  counts,
}: HistoryToolbarProps) {
  const tabs: { id: HistoryFilterTab; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All Resumes", count: counts.all, icon: FileText },
    { id: "ats-optimized", label: "ATS Optimized", count: counts.atsOptimized, icon: ShieldCheck },
    { id: "custom-templates", label: "Custom Templates", count: counts.customTemplates, icon: Sparkles },
    { id: "starred", label: "Starred", count: counts.starred, icon: Star },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-shrink-0 border ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? "bg-blue-500/40 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Filter Dropdown Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resumes by title, role, template, or skills..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Template Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <select
              value={templateFilter}
              onChange={(e) => onTemplateFilterChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Templates</option>
              <option value="modern">Modern</option>
              <option value="professional">Professional</option>
              <option value="minimalist">Minimalist</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as HistorySortOption)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="recent-updated">Sort: Recently Updated</option>
              <option value="recent-created">Sort: Recently Created</option>
              <option value="ats-score">Sort: ATS Score (High to Low)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
