import React from "react";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  JobFilterState,
  ExperienceLevel,
  SalaryRangeOption,
  RemoteOption,
  CompanyTypeOption,
  DatePostedOption,
} from "./JobTypes";

interface FilterChipsRowProps {
  filters: JobFilterState;
  onFilterChange: (updates: Partial<JobFilterState>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export default function FilterChipsRow({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: FilterChipsRowProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 pr-2 shrink-0 hidden sm:flex">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filters</span>
      </div>

      {/* Experience Filter */}
      <div className="relative shrink-0">
        <select
          value={filters.experience}
          onChange={(e) => onFilterChange({ experience: e.target.value as ExperienceLevel })}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer appearance-none pr-6 ${
            filters.experience !== "Any"
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <option value="Any">Experience: Any</option>
          <option value="Entry Level">Entry Level (0-2 yrs)</option>
          <option value="Mid Level">Mid Level (3-5 yrs)</option>
          <option value="Senior">Senior (5-8 yrs)</option>
          <option value="Lead">Lead / Architect (8+ yrs)</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
          ▼
        </span>
      </div>

      {/* Salary Filter */}
      <div className="relative shrink-0">
        <select
          value={filters.salary}
          onChange={(e) => onFilterChange({ salary: e.target.value as SalaryRangeOption })}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer appearance-none pr-6 ${
            filters.salary !== "Any"
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <option value="Any">Salary: Any</option>
          <option value="₹6–10 LPA">₹6–10 LPA</option>
          <option value="₹10–18 LPA">₹10–18 LPA</option>
          <option value="₹18–30 LPA">₹18–30 LPA</option>
          <option value="₹30+ LPA">₹30+ LPA</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
          ▼
        </span>
      </div>

      {/* Remote / Work Mode Filter */}
      <div className="relative shrink-0">
        <select
          value={filters.remote}
          onChange={(e) => onFilterChange({ remote: e.target.value as RemoteOption })}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer appearance-none pr-6 ${
            filters.remote !== "Any"
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <option value="Any">Work Mode: Any</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
          ▼
        </span>
      </div>

      {/* Company Type Filter */}
      <div className="relative shrink-0">
        <select
          value={filters.companyType}
          onChange={(e) => onFilterChange({ companyType: e.target.value as CompanyTypeOption })}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer appearance-none pr-6 ${
            filters.companyType !== "Any"
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <option value="Any">Company: Any</option>
          <option value="Product">Product Tech</option>
          <option value="Startup">High-Growth Startup</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
          ▼
        </span>
      </div>

      {/* Date Posted Filter */}
      <div className="relative shrink-0">
        <select
          value={filters.datePosted}
          onChange={(e) => onFilterChange({ datePosted: e.target.value as DatePostedOption })}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition cursor-pointer appearance-none pr-6 ${
            filters.datePosted !== "Any"
              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300 font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <option value="Any">Date Posted: Any</option>
          <option value="Past 24h">Past 24 Hours</option>
          <option value="Past Week">Past Week</option>
          <option value="Past Month">Past Month</option>
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
          ▼
        </span>
      </div>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );
}
