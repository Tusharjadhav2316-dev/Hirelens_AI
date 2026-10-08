"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteUserAccount,
  UserProfile,
} from "@/lib/profileService";
import { getRecentHistory } from "@/lib/historyService";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Moon, Sun, AlertTriangle, Trash2, Shield, Bell, CreditCard, Sparkles } from "lucide-react";

import ProfileSettingsHeader from "@/components/profile-settings/ProfileSettingsHeader";
import SettingsNavTabs, { SettingsTabId } from "@/components/profile-settings/SettingsNavTabs";
import ProfileInfoForm from "@/components/profile-settings/ProfileInfoForm";
import ProfileCompletionCard from "@/components/profile-settings/ProfileCompletionCard";
import ProfileSkillsCard from "@/components/profile-settings/ProfileSkillsCard";
import ProfileResumeCard from "@/components/profile-settings/ProfileResumeCard";
import { ResumeVersionItem } from "@/components/resume-history/HistoryTypes";
import { SAMPLE_RESUME_VERSIONS } from "@/components/resume-history/sampleResumeVersions";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTabId>("personal-info");
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    headline: "",
    aboutMe: "",
    college: "",
    degree: "",
    graduationYear: "",
    linkedinUrl: "",
    githubUrl: "",
    skills: ["React", "TypeScript", "Next.js"],
    defaultTemplate: "professional",
    themePreference: "system",
    avatarUrl: "",
  });

  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  const [userResumes, setUserResumes] = useState<ResumeVersionItem[]>(SAMPLE_RESUME_VERSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Check if sign-in provider is Google
  const isGoogleLinked = useMemo(() => {
    return Boolean(
      user?.providerData?.some((p) => p.providerId === "google.com")
    );
  }, [user]);

  // Load User Profile and Resumes
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Profile
        const fetched = await getUserProfile(user.uid);
        if (fetched) {
          const merged: UserProfile = {
            fullName: fetched.fullName || user.displayName || "User",
            email: user.email || fetched.email || "",
            phoneNumber: fetched.phoneNumber || "",
            location: fetched.location || "",
            headline: fetched.headline || "",
            aboutMe: fetched.aboutMe || "",
            college: fetched.college || "",
            degree: fetched.degree || "",
            graduationYear: fetched.graduationYear || "",
            linkedinUrl: fetched.linkedinUrl || "",
            githubUrl: fetched.githubUrl || "",
            skills: fetched.skills || ["React", "TypeScript", "Next.js"],
            defaultResumeId: fetched.defaultResumeId || "",
            defaultTemplate: fetched.defaultTemplate || "professional",
            themePreference: fetched.themePreference || "system",
            avatarUrl: fetched.avatarUrl || user.photoURL || "",
          };
          setProfile(merged);
          setInitialProfile(merged);
        }

        // 2. Fetch User's Real History Resumes
        const historyData = await getRecentHistory(user.uid);
        const resumeActivities = historyData.filter((i) => i.type === "resume");
        if (resumeActivities.length > 0) {
          const mapped: ResumeVersionItem[] = resumeActivities.map((act) => ({
            id: act.id,
            title: act.title,
            roleTitle: act.metadata?.jobTitle || "Resume Draft",
            template: (act.structuredData?.template as any) || "modern",
            atsScore: act.metadata?.score || 85,
            isAtsOptimized: (act.metadata?.score || 85) >= 80,
            isStarred: false,
            skills: act.structuredData?.skills?.map((s: any) => typeof s === "string" ? s : s.name) || ["React", "TypeScript"],
            updatedAt: "Recently",
            createdAt: "Recently",
            viewsCount: 12,
            downloadsCount: 3,
            resumeData: act.structuredData,
          }));
          setUserResumes([...mapped, ...SAMPLE_RESUME_VERSIONS]);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Track Unsaved Changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  // Profile Field Updates
  const handleProfileChange = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    if (!user?.uid) {
      toast.error("You must be logged in to save settings.");
      return;
    }

    if (!profile.fullName?.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      setInitialProfile(profile);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar Upload Handler
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.uid || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const base64Url = await uploadAvatar(user.uid, file);
      setProfile((prev) => ({ ...prev, avatarUrl: base64Url }));
      toast.success("Profile photo updated successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (!user?.uid) return;

    const confirm = window.confirm(
      "Are you sure you want to permanently delete your account? All saved resumes, ATS history, and settings will be permanently erased."
    );
    if (!confirm) return;

    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(user.uid);
      toast.success("Account deleted.");
      router.push("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please re-authenticate and try again.");
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-600" />
        <p className="font-medium animate-pulse text-sm">Loading your profile settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <ProfileSettingsHeader />

      {/* 2. Navigation Tabs */}
      <SettingsNavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 3. Tab Content */}
      {activeTab === "personal-info" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Information (68% width on desktop) */}
          <div className="lg:col-span-8">
            <ProfileInfoForm
              profile={profile}
              onChange={handleProfileChange}
              onSave={handleSaveProfile}
              onUploadAvatar={handleUploadAvatar}
              isSaving={isSaving}
              isUploadingAvatar={isUploadingAvatar}
              isGoogleLinked={isGoogleLinked}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>

          {/* Right Column: Completion, Skills, Resume (32% width on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileCompletionCard profile={profile} />
            <ProfileSkillsCard
              skills={profile.skills || []}
              onChangeSkills={(newSkills) => handleProfileChange({ skills: newSkills })}
            />
            <ProfileResumeCard
              resumes={userResumes}
              defaultResumeId={profile.defaultResumeId}
              onSelectDefaultResume={(id) => handleProfileChange({ defaultResumeId: id })}
            />
          </div>
        </div>
      )}

      {/* Account & Security Tab */}
      {activeTab === "account-security" && (
        <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Authentication & Security
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your account is authenticated via Firebase. Passwords and identity provider tokens are secured using industry-standard encryption.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold">Registered Email:</p>
              <p className="font-mono mt-0.5 text-slate-900 dark:text-white">{user?.email || "Not signed in"}</p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-red-700/80 dark:text-red-300/80">
              Permanently delete your account and all associated resumes, ATS reports, and interview records. This action cannot be reversed.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white transition shadow-sm cursor-pointer"
            >
              {isDeletingAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isDeletingAccount ? "Deleting Account..." : "Delete Account"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Workspace & Display Preferences
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === "light"
                      ? "bg-violet-50 text-violet-700 border-violet-300"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === "dark"
                      ? "bg-violet-950/60 text-violet-300 border-violet-700"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-3xl animate-in fade-in duration-200">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Email alerts for new job matches, weekly career milestones, and application status updates will be configurable in Sprint 12.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <div className="max-w-3xl animate-in fade-in duration-200">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              HireLens Pro Subscription
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You are currently on the HireLens Free Tier. Pro plan management with unlimited ATS score scans and mock interview voice training will be available soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
