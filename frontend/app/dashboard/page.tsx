"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  ShieldCheck,
  Mail,
  Briefcase,
  Video,
  Eye,
  Send,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { FeatureVariant } from "@/components/common/IconTile";

// Data Services
import { getRecentHistory, ActivityHistoryItem } from "@/lib/historyService";
import { listTrainerSessions } from "@/lib/interviewTrainerSessionService";

// Shared and Dashboard Components
import StatCard from "@/components/dashboard/StatCard";
import CareerJourney from "@/components/dashboard/CareerJourney";
import RecentResumesCard from "@/components/dashboard/RecentResumesCard";
import RecommendedCard from "@/components/dashboard/RecommendedCard";
import ActivityOverviewCard from "@/components/dashboard/ActivityOverviewCard";
import ActionCard from "@/components/common/ActionCard";
import PromoBand from "@/components/common/PromoBand";
import ScriptAccent from "@/components/common/ScriptAccent";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [historyItems, setHistoryItems] = useState<ActivityHistoryItem[]>([]);
  const [interviewCount, setInterviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  // Calculate greeting dynamically
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    // Client-side date formatting
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setCurrentDateStr(formatted);

    async function loadDashboardData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch real user history from Firestore
        const history = await getRecentHistory(user.uid);
        setHistoryItems(history || []);

        // Fetch interview trainer session count if available
        try {
          const sessions = await listTrainerSessions(20);
          setInterviewCount(sessions?.length || 0);
        } catch {
          setInterviewCount(0);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  // Derive real ATS score if available
  const resumeItems = historyItems.filter(
    (item) => item.type === "resume" || item.type === "ats-analysis"
  );
  const scoredItem = resumeItems.find(
    (item) => typeof item.metadata?.score === "number"
  );
  const latestAtsScore: number | null =
    scoredItem && typeof scoredItem.metadata?.score === "number"
      ? scoredItem.metadata.score
      : null;

  // Quick Action items matching PDF Page 8
  const quickActions: {
    title: string;
    description: string;
    icon: typeof FileText;
    iconVariant: FeatureVariant;
    href: string;
  }[] = [
    {
      title: "Create Resume",
      description: "Build an ATS-ready resume with AI guidance.",
      icon: FileText,
      iconVariant: "blue",
      href: "/dashboard/builder",
    },
    {
      title: "Analyze Resume",
      description: "Scan your resume for ATS score and suggestions.",
      icon: ShieldCheck,
      iconVariant: "indigo",
      href: "/dashboard/resume-analyzer",
    },
    {
      title: "Generate Cover Letter",
      description: "Tailor a compelling cover letter in seconds.",
      icon: Mail,
      iconVariant: "rose",
      href: "/dashboard/cover-letter",
    },
    {
      title: "Find Jobs",
      description: "Match open roles tailored to your skills.",
      icon: Briefcase,
      iconVariant: "emerald",
      href: "/dashboard/job-matcher",
    },
    {
      title: "Interview Practice",
      description: "Mock interview with real-time AI feedback.",
      icon: Video,
      iconVariant: "amber",
      href: "/dashboard/interview-trainer",
    },
  ];


  const displayName = user?.displayName ? user.displayName.split(" ")[0] : "User";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header & Greeting Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {displayName}! 👋
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here's your career progress at a glance. Keep going, great things take time.
          </p>
        </div>

        {/* Header Right: Date Badge + Stay Consistent Nudge */}
        <div className="flex flex-wrap items-center gap-3">
          {currentDateStr && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentDateStr}</span>
            </div>
          )}

          {/* "Stay Consistent" Nudge Card */}
          <div className="relative flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/60 dark:border-indigo-800/40 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div className="pr-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Stay consistent
                </span>
                <ScriptAccent
                  text="Same You. Bigger Opportunities."
                  className="hidden sm:inline-flex text-xs scale-75 origin-left"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Daily progress leads to better opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Statistics Grid (4 StatCards matching PDF Page 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Resume Score (Real or Honest Empty State) */}
        <StatCard
          title="Resume Score"
          value={latestAtsScore !== null ? latestAtsScore : "—"}
          subValue={latestAtsScore !== null ? "/ 100" : undefined}
          badgeText={
            latestAtsScore !== null
              ? latestAtsScore >= 80
                ? "+12% Good ATS"
                : "Needs Review"
              : "Not Analyzed"
          }
          badgeVariant={latestAtsScore !== null && latestAtsScore >= 80 ? "success" : "muted"}
          caption={
            latestAtsScore !== null
              ? "Calculated from latest resume"
              : "Run ATS analysis to calculate score"
          }
          icon={ShieldCheck}
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        {/* Stat 2: Applications (Honest Empty State) */}
        <StatCard
          title="Applications"
          value="—"
          badgeText="Coming Soon"
          badgeVariant="muted"
          caption="Application tracking pipeline"
          icon={Send}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        {/* Stat 3: Interviews (Real Count or Honest Zero) */}
        <StatCard
          title="Interviews"
          value={interviewCount > 0 ? interviewCount : "0"}
          badgeText={interviewCount > 0 ? "Active Practice" : "Not Started"}
          badgeVariant={interviewCount > 0 ? "brand" : "muted"}
          caption={
            interviewCount > 0
              ? `${interviewCount} mock sessions completed`
              : "Practice with AI mock interviewer"
          }
          icon={Video}
          iconBg="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        {/* Stat 4: Profile Views (Honest Empty State) */}
        <StatCard
          title="Profile Views"
          value="—"
          badgeText="Private"
          badgeVariant="muted"
          caption="Profile visibility insights"
          icon={Eye}
          iconBg="bg-purple-50 dark:bg-purple-950/50"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 3. Career Journey Tracker */}
      <CareerJourney
        hasResume={resumeItems.length > 0}
        interviewCount={interviewCount}
      />

      {/* 4. Quick Actions Grid (5 Cards matching PDF Page 8) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Common workflows
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              iconVariant={action.iconVariant}
              href={action.href}
            />
          ))}
        </div>
      </div>

      {/* 5. Bottom Tri-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Recent Resumes (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col">
          <RecentResumesCard items={historyItems} loading={loading} />
        </div>

        {/* Col 2: Recommended for You (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col">
          <RecommendedCard />
        </div>

        {/* Col 3: Activity Overview (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col">
          <ActivityOverviewCard />
        </div>
      </div>

      {/* 6. Closing Promotional CTA Band */}
      <PromoBand
        headline="Let AI be your career companion."
        description="From resume refinement to live interview coaching, your AI copilot is ready to assist you every step of the way."
        buttonText="Chat with AI Agent"
        onButtonClick={() => router.push("/dashboard/agent")}
        scriptText="A Brighter You"
      />
    </div>
  );
}
