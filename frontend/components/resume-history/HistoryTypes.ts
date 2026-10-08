import { Resume } from "@/types/resume";

export interface ResumeVersionItem {
  id: string;
  title: string;
  roleTitle: string;
  template: "modern" | "professional" | "minimalist" | "creative";
  atsScore: number;
  isAtsOptimized: boolean;
  isCustomTemplate?: boolean;
  isStarred: boolean;
  skills: string[];
  updatedAt: string;
  createdAt: string;
  viewsCount: number;
  downloadsCount: number;
  resumeData: Resume;
}

export type HistoryFilterTab = "all" | "ats-optimized" | "custom-templates" | "starred";

export type HistorySortOption = "recent-updated" | "recent-created" | "ats-score";
