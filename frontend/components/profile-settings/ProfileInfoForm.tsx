import React, { useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Mail,
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Lock,
  Save,
  Loader2,
  Check,
  Globe,
} from "lucide-react";
import { UserProfile } from "@/lib/profileService";

interface ProfileInfoFormProps {
  profile: UserProfile;
  onChange: (updates: Partial<UserProfile>) => void;
  onSave: () => void;
  onUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isGoogleLinked: boolean;
  hasUnsavedChanges: boolean;
}

export default function ProfileInfoForm({
  profile,
  onChange,
  onSave,
  onUploadAvatar,
  isSaving,
  isUploadingAvatar,
  isGoogleLinked,
  hasUnsavedChanges,
}: ProfileInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const headlineCount = profile.headline?.length || 0;
  const aboutMeCount = profile.aboutMe?.length || 0;

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 120) {
      onChange({ headline: e.target.value });
    }
  };

  const handleAboutMeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 500) {
      onChange({ aboutMe: e.target.value });
    }
  };

  // Graduation year options (past 30 years to next 5 years)
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 35 }, (_, i) => currentYear + 4 - i);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Profile Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your photo and personal career details visible across resumes.
          </p>
        </div>
        {hasUnsavedChanges && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="p-5 sm:p-7 space-y-7">
        {/* 1. Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
          <div className="relative group flex-shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName || "User Avatar"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="w-12 h-12 text-slate-400 dark:text-slate-500 stroke-1" />
              )}
            </div>

            {/* Camera Floating Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition cursor-pointer active:scale-90"
              title="Upload new profile photo"
              aria-label="Upload profile photo"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Profile Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a clear professional headshot. Recommended JPG, PNG, or WebP under 2MB.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={onUploadAvatar}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-violet-500" />
                <span>{isUploadingAvatar ? "Uploading..." : "Change Photo"}</span>
              </button>

              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ avatarUrl: "" })}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 transition cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Personal Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.fullName || ""}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
              required
            />
          </div>

          {/* Email Address (Immutable / Provider managed) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              {isGoogleLinked && (
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Linked with Google
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={profile.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={profile.phoneNumber || ""}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              placeholder="e.g. +1 (555) 234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>
        </div>

        {/* Headline (with 0/120 live counter) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Headline</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                headlineCount >= 110 ? "text-amber-500 font-bold" : "text-slate-400"
              }`}
            >
              {headlineCount}/120
            </span>
          </div>
          <input
            type="text"
            value={profile.headline || ""}
            onChange={handleHeadlineChange}
            placeholder="e.g. Senior Frontend Architect • React & Design Systems"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
            maxLength={120}
          />
        </div>

        {/* About Me (with 0/500 live counter) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              About Me
            </label>
            <span
              className={`text-[11px] font-mono ${
                aboutMeCount >= 480 ? "text-amber-500 font-bold" : "text-slate-400"
              }`}
            >
              {aboutMeCount}/500
            </span>
          </div>
          <textarea
            value={profile.aboutMe || ""}
            onChange={handleAboutMeChange}
            rows={3}
            placeholder="Brief summary of your professional background, key career highlights, and passion areas..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition resize-y"
            maxLength={500}
          />
        </div>

        {/* 3. Education Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Education
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                College / University
              </label>
              <input
                type="text"
                value={profile.college || ""}
                onChange={(e) => onChange({ college: e.target.value })}
                placeholder="e.g. UC Berkeley"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Degree & Field
              </label>
              <input
                type="text"
                value={profile.degree || ""}
                onChange={(e) => onChange({ degree: e.target.value })}
                placeholder="e.g. B.S. in Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Graduation Year</span>
              </label>
              <select
                value={profile.graduationYear || ""}
                onChange={(e) => onChange({ graduationYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="">Select Year</option>
                {graduationYears.map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Social Profiles Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Social Profiles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LinkedIn Profile */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.6a1.6 1.6 0 0 0-1.6 1.6c0 .88.72 1.6 1.6 1.6a1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z" />
                </svg>
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="url"
                value={profile.linkedinUrl || ""}
                onChange={(e) => onChange({ linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            {/* GitHub Profile */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
                <span>GitHub Profile</span>
              </label>
              <input
                type="url"
                value={profile.githubUrl || ""}
                onChange={(e) => onChange({ githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Save Button */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          Last updated recently
        </span>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !profile.fullName?.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white transition shadow-sm shadow-violet-500/25 cursor-pointer active:scale-95 ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
