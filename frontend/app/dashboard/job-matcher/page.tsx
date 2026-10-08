"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useResume } from "@/contexts/ResumeContext";
import JDMatcherPanel from "@/components/resume-builder/JDMatcherPanel";
import JobSearchHeader from "@/components/job-search/JobSearchHeader";
import SearchBar from "@/components/job-search/SearchBar";
import FilterChipsRow from "@/components/job-search/FilterChipsRow";
import JobCard from "@/components/job-search/JobCard";
import SavedJobsCard from "@/components/job-search/SavedJobsCard";
import ApplicationTrackerCard from "@/components/job-search/ApplicationTrackerCard";
import AIMatchingPromoCard from "@/components/job-search/AIMatchingPromoCard";
import TrackApplicationsDrawer from "@/components/job-search/TrackApplicationsDrawer";
import { DEMO_JOB_LISTINGS } from "@/components/job-search/DemoJobs";
import {
  JobListing,
  JobFilterState,
  ApplicationRecord,
  ApplicationStatus,
  SortOption,
} from "@/components/job-search/JobTypes";
import { Sparkles, Briefcase, ArrowUpDown, SearchX } from "lucide-react";
import { toast } from "sonner";

const INITIAL_FILTERS: JobFilterState = {
  searchQuery: "",
  location: "",
  jobType: "All Types",
  experience: "Any",
  salary: "Any",
  remote: "Any",
  companyType: "Any",
  datePosted: "Any",
  sortBy: "relevance",
};

export default function JobMatcherPage() {
  const { resume } = useResume();

  // Active Tab: "listings" | "ai-matched"
  const [activeTab, setActiveTab] = useState<"listings" | "ai-matched">("listings");

  // Filters State
  const [filters, setFilters] = useState<JobFilterState>(INITIAL_FILTERS);

  // Saved Jobs State (persisted to localStorage)
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hirelens_saved_jobs");
        return saved ? JSON.parse(saved) : ["job-1"];
      } catch {
        return ["job-1"];
      }
    }
    return ["job-1"];
  });

  // Track Applications State (persisted to localStorage)
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hirelens_tracked_applications");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("hirelens_saved_jobs", JSON.stringify(savedJobIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedJobIds]);

  useEffect(() => {
    try {
      localStorage.setItem("hirelens_tracked_applications", JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  // Filter Updates
  const handleFilterChange = (updates: Partial<JobFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    toast.info("Filters cleared");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.location) count++;
    if (filters.jobType !== "All Types") count++;
    if (filters.experience !== "Any") count++;
    if (filters.salary !== "Any") count++;
    if (filters.remote !== "Any") count++;
    if (filters.companyType !== "Any") count++;
    if (filters.datePosted !== "Any") count++;
    return count;
  }, [filters]);

  // Saved Jobs Toggle
  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      if (exists) {
        toast.info("Job removed from saved list");
        return prev.filter((id) => id !== jobId);
      } else {
        toast.success("Job saved to your bookmarks");
        return [...prev, jobId];
      }
    });
  };

  // Quick Apply Handler
  const handleApplyClick = (job: JobListing) => {
    const existing = applications.find((a) => a.jobId === job.id);
    if (!existing) {
      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salary: job.salaryRange,
        status: "Applied",
        appliedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        lastUpdated: new Date().toISOString(),
      };
      setApplications((prev) => [newApp, ...prev]);
      toast.success(`Application tracked for ${job.title} at ${job.company}`);
    } else {
      toast.info(`You already applied to ${job.title} at ${job.company}`);
    }
    setIsTrackerOpen(true);
  };

  // Application CRUD handlers
  const handleAddApplication = (appData: Omit<ApplicationRecord, "id" | "lastUpdated">) => {
    const newApp: ApplicationRecord = {
      ...appData,
      id: `app-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    toast.success("Application added to tracker");
  };

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus, lastUpdated: new Date().toISOString() } : a))
    );
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    toast.info("Application removed");
  };

  // Filter & Sort Jobs
  const filteredJobs = useMemo(() => {
    return DEMO_JOB_LISTINGS.filter((job) => {
      // Search query filter (matches title, company, skills, or description)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(query));
        const matchesDesc = job.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc) {
          return false;
        }
      }

      // Location filter
      if (filters.location.trim()) {
        const loc = filters.location.toLowerCase();
        const matchesLocation = job.location.toLowerCase().includes(loc);
        const matchesRemote = job.workMode.toLowerCase().includes(loc);
        if (!matchesLocation && !matchesRemote) {
          return false;
        }
      }

      // Job Type filter
      if (filters.jobType !== "All Types") {
        if (job.jobType !== filters.jobType) return false;
      }

      // Experience Level filter
      if (filters.experience !== "Any") {
        if (job.experienceLevel !== filters.experience) return false;
      }

      // Work Mode filter
      if (filters.remote !== "Any") {
        if (job.workMode !== filters.remote) return false;
      }

      // Company Type filter
      if (filters.companyType !== "Any") {
        if (job.companyType !== filters.companyType) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "match") {
        return b.matchScore - a.matchScore;
      }
      if (filters.sortBy === "relevance") {
        return (b.isBestMatch ? 1 : 0) - (a.isBestMatch ? 1 : 0) || b.matchScore - a.matchScore;
      }
      return 0;
    });
  }, [filters]);

  const savedJobs = useMemo(() => {
    return DEMO_JOB_LISTINGS.filter((job) => savedJobIds.includes(job.id));
  }, [savedJobIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Page Header matching PDF Page 1 */}
      <JobSearchHeader
        onTrackApplicationsClick={() => setIsTrackerOpen(true)}
        applicationsCount={applications.length}
      />

      {/* 2. Search Bar */}
      <SearchBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchSubmit={() => {
          if (activeTab !== "listings") setActiveTab("listings");
          toast.success("Searched jobs matching criteria");
        }}
      />

      {/* 3. Filter Chips Row */}
      <FilterChipsRow
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* 4. Main Tabs & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "listings"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Job Listings</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai-matched")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "ai-matched"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Matched Jobs</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
              New
            </span>
          </button>
        </div>

        {/* Sort Control */}
        {activeTab === "listings" && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end sm:self-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
              className="bg-transparent text-slate-900 dark:text-white font-bold border-none focus:outline-none cursor-pointer"
            >
              <option value="relevance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Relevance
              </option>
              <option value="match" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Highest Match %
              </option>
              <option value="date" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Date Posted
              </option>
            </select>
          </div>
        )}
      </div>

      {/* 5. Main Workspace */}
      {activeTab === "listings" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Cards List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No jobs found matching criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms, changing work modes, or clearing active filters to see all available opportunities.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleSave={handleToggleSave}
                  onApplyClick={handleApplyClick}
                />
              ))
            )}
          </div>

          {/* Right Rail: Saved Jobs + Application Tracker + AI Matching Promo (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Saved Jobs Card */}
            <SavedJobsCard
              savedJobs={savedJobs}
              onRemoveSaved={handleToggleSave}
              onJobClick={(job) => {
                handleFilterChange({ searchQuery: job.company });
              }}
            />

            {/* 2. Application Tracker Card */}
            <ApplicationTrackerCard
              applications={applications}
              onOpenTrackerDrawer={() => setIsTrackerOpen(true)}
            />

            {/* 3. AI Job Matching Promo Card */}
            <AIMatchingPromoCard
              onActivateAIMatching={() => setActiveTab("ai-matched")}
            />
          </div>
        </div>
      ) : (
        /* AI Matched Jobs: Preserves JDMatcherPanel */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                AI Target Role Alignment & JD Matcher
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                Paste any target job description below to calculate exact ATS keyword alignment against your active resume and receive deep AI tailoring insights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <JDMatcherPanel resume={resume} />
          </div>
        </div>
      )}

      {/* Slide-over Application Tracker Drawer */}
      <TrackApplicationsDrawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        applications={applications}
        onAddApplication={handleAddApplication}
        onUpdateStatus={handleUpdateStatus}
        onDeleteApplication={handleDeleteApplication}
      />
    </div>
  );
}
