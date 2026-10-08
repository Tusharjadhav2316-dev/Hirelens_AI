export interface CoachingTopic {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  category: "planning" | "development" | "growth" | "workplace";
  suggestedPrompt: string;
}

export type RoadmapStepStatus = "completed" | "current" | "upcoming";

export interface RoadmapStep {
  id: number;
  number: string;
  title: string;
  status: RoadmapStepStatus;
  summary: string;
  deliverables: string[];
  suggestedTech: string[];
  estimatedWeeks: string;
  completionCriteria: string;
}

export interface CareerRoadmap {
  id: string;
  roleTitle: string;
  industry: string;
  level: string;
  totalSteps: number;
  currentStepIndex: number;
  steps: RoadmapStep[];
}

export interface CareerMilestone {
  id: string;
  label: string;
  stage: string;
  status: "completed" | "current" | "upcoming";
  description: string;
}

export interface RecommendedArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  snippet: string;
  gradient: string;
  iconName: string;
  url?: string;
}

export interface CoachMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp?: string;
  topicId?: string;
  hasRoadmap?: boolean;
}
