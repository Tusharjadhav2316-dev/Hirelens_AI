import React from "react";
import { Search, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { JobFilterState, JobTypeOption } from "./JobTypes";

interface SearchBarProps {
  filters: JobFilterState;
  onFilterChange: (updates: Partial<JobFilterState>) => void;
  onSearchSubmit: () => void;
}

export default function SearchBar({
  filters,
  onFilterChange,
  onSearchSubmit,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
        {/* Search Query Input */}
        <div className="md:col-span-4 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Job title, skills, or company"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </div>

        {/* Location Input */}
        <div className="md:col-span-3 relative flex items-center">
          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            placeholder="City, state, or 'Remote'"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </div>

        {/* Job Type Select */}
        <div className="md:col-span-3 relative flex items-center">
          <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
          <select
            value={filters.jobType}
            onChange={(e) => onFilterChange({ jobType: e.target.value as JobTypeOption })}
            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition appearance-none cursor-pointer"
          >
            <option value="All Types">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500 text-xs">
            ▼
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-[0.98] transition cursor-pointer"
          >
            <span>Search Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
