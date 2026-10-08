"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import { getRecentHistory, deleteHistoryItem, ActivityHistoryItem } from "@/lib/historyService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import ResumeHistoryHeader from "@/components/resume-history/ResumeHistoryHeader";
import HistoryMetricsRow from "@/components/resume-history/HistoryMetricsRow";
import HistoryToolbar from "@/components/resume-history/HistoryToolbar";
import ResumeVersionList from "@/components/resume-history/ResumeVersionList";
import ResumeHistoryPreviewPanel from "@/components/resume-history/ResumeHistoryPreviewPanel";
import {
  ResumeVersionItem,
  HistoryFilterTab,
  HistorySortOption,
} from "@/components/resume-history/HistoryTypes";
import { SAMPLE_RESUME_VERSIONS } from "@/components/resume-history/sampleResumeVersions";

export default function ResumeHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setResume } = useResume();

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [versions, setVersions] = useState<ResumeVersionItem[]>(SAMPLE_RESUME_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    SAMPLE_RESUME_VERSIONS[0]?.id || null
  );

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<HistoryFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<HistorySortOption>("recent-updated");
  const [templateFilter, setTemplateFilter] = useState("all");

  // Load user's real Firestore resume activities
  const loadHistory = async () => {
    setIsRefreshing(true);
    try {
      if (user?.uid) {
        const historyData = await getRecentHistory(user.uid);
        const resumeActivities = historyData.filter((item) => item.type === "resume");

        if (resumeActivities.length > 0) {
          const userVersions: ResumeVersionItem[] = resumeActivities.map((item) => {
            const resumeData = item.structuredData || {
              id: item.id,
              title: item.title,
              template: "modern",
              personalInfo: {
                fullName: user.displayName || "User Name",
                email: user.email || "",
                phone: "",
                location: "",
                summary: item.contentSnapshot || "",
              },
              experience: [],
              education: [],
              skills: [],
              projects: [],
              achievements: [],
              certifications: [],
            };

            const score = item.metadata?.score || 85;
            return {
              id: item.id,
              title: item.title || "Custom Resume Draft",
              roleTitle: item.metadata?.jobTitle || "Software Engineer",
              template: (resumeData.template as any) || "modern",
              atsScore: score,
              isAtsOptimized: score >= 80,
              isCustomTemplate: false,
              isStarred: false,
              skills: resumeData.skills?.slice(0, 6) || ["React", "TypeScript", "Next.js"],
              updatedAt: item.createdAt?.toDate ? "Recently" : "Just now",
              createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Recently",
              viewsCount: 12,
              downloadsCount: 3,
              resumeData,
            };
          });

          // Combine with sample versions (avoid duplicate ids)
          const combined = [
            ...userVersions,
            ...SAMPLE_RESUME_VERSIONS.filter((s) => !userVersions.some((u) => u.id === s.id)),
          ];
          setVersions(combined);
          if (!selectedVersionId && combined.length > 0) {
            setSelectedVersionId(combined[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading resume history:", error);
      toast.error("Failed to refresh resume history");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Star Toggle
  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newStarred = !v.isStarred;
          toast.success(newStarred ? "Added to Starred" : "Removed from Starred");
          return { ...v, isStarred: newStarred };
        }
        return v;
      })
    );
  };

  // Edit action: Load into ResumeContext and navigate to builder
  const handleEdit = (version: ResumeVersionItem) => {
    if (version.resumeData) {
      setResume(version.resumeData);
    }
    toast.success(`Loaded "${version.title}" into Resume Builder`);
    router.push("/dashboard/builder");
  };

  // Duplicate action
  const handleDuplicate = (version: ResumeVersionItem) => {
    const newId = `ver-${Date.now()}`;
    const duplicated: ResumeVersionItem = {
      ...version,
      id: newId,
      title: `${version.title} (Copy)`,
      updatedAt: "Just now",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      viewsCount: 0,
      downloadsCount: 0,
      resumeData: {
        ...version.resumeData,
        id: newId,
        title: `${version.title} (Copy)`,
      },
    };
    setVersions((prev) => [duplicated, ...prev]);
    setSelectedVersionId(newId);
    toast.success(`Duplicated "${version.title}"`);
  };

  // Delete action
  const handleDelete = async (id: string) => {
    const target = versions.find((v) => v.id === id);
    if (!target) return;

    if (window.confirm(`Are you sure you want to delete "${target.title}"?`)) {
      try {
        if (user?.uid) {
          // Attempt Firestore delete in case it's a real stored activity
          await deleteHistoryItem(user.uid, id).catch(() => {});
        }
        setVersions((prev) => prev.filter((v) => v.id !== id));
        if (selectedVersionId === id) {
          const remaining = versions.filter((v) => v.id !== id);
          setSelectedVersionId(remaining[0]?.id || null);
        }
        toast.success(`Deleted "${target.title}"`);
      } catch (err) {
        toast.error("Failed to delete resume version");
      }
    }
  };

  // Clear all active filters
  const handleClearFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setTemplateFilter("all");
    setSortBy("recent-updated");
  };

  // Calculate filtered and sorted versions
  const filteredVersions = useMemo(() => {
    return versions
      .filter((v) => {
        // Tab Filter
        if (activeTab === "ats-optimized" && !v.isAtsOptimized) return false;
        if (activeTab === "custom-templates" && !v.isCustomTemplate) return false;
        if (activeTab === "starred" && !v.isStarred) return false;

        // Template Filter
        if (templateFilter !== "all" && v.template.toLowerCase() !== templateFilter.toLowerCase()) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = v.title.toLowerCase().includes(query);
          const matchRole = v.roleTitle.toLowerCase().includes(query);
          const matchTemplate = v.template.toLowerCase().includes(query);
          const matchSkills = v.skills.some((s) => s.toLowerCase().includes(query));
          if (!matchTitle && !matchRole && !matchTemplate && !matchSkills) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "ats-score") {
          return b.atsScore - a.atsScore;
        }
        // Recently created / updated fallback
        return 0;
      });
  }, [versions, activeTab, templateFilter, searchQuery, sortBy]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: versions.length,
      atsOptimized: versions.filter((v) => v.isAtsOptimized).length,
      customTemplates: versions.filter((v) => v.isCustomTemplate).length,
      starred: versions.filter((v) => v.isStarred).length,
    };
  }, [versions]);

  // Selected Version item
  const selectedVersion = useMemo(() => {
    return versions.find((v) => v.id === selectedVersionId) || filteredVersions[0] || null;
  }, [versions, selectedVersionId, filteredVersions]);

  const isFiltered =
    activeTab !== "all" || searchQuery.trim() !== "" || templateFilter !== "all";

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <ResumeHistoryHeader
        onRefresh={loadHistory}
        isRefreshing={isRefreshing}
      />

      {/* 2. Top Metrics */}
      <HistoryMetricsRow
        totalResumes={versions.length}
        atsOptimizedCount={counts.atsOptimized}
        totalViews={312}
        totalDownloads={28}
      />

      {/* 3. Filter & Search Toolbar */}
      <HistoryToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        templateFilter={templateFilter}
        onTemplateFilterChange={setTemplateFilter}
        counts={counts}
      />

      {/* 4. 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resume Version List (~42% on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Resume Versions ({filteredVersions.length})
            </h2>
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          <ResumeVersionList
            versions={filteredVersions}
            selectedVersionId={selectedVersion?.id || null}
            onSelectVersion={(v) => setSelectedVersionId(v.id)}
            onToggleStar={handleToggleStar}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDownload={handleEdit}
            onDelete={handleDelete}
            onClearFilters={handleClearFilters}
            isFiltered={isFiltered}
          />
        </div>

        {/* Right Column: Live Resume Preview Panel (~58% on desktop) */}
        <div className="lg:col-span-7 sticky top-6">
          <ResumeHistoryPreviewPanel
            selectedVersion={selectedVersion}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}
