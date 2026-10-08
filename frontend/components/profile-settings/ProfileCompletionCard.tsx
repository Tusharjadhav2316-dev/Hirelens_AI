import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import ScoreRing from "@/components/common/ScoreRing";
import { UserProfile } from "@/lib/profileService";

interface ProfileCompletionCardProps {
  profile: UserProfile;
}

export default function ProfileCompletionCard({
  profile,
}: ProfileCompletionCardProps) {
  // Real calculation checklist
  const criteria = [
    {
      id: "photo",
      label: "Profile Photo",
      completed: Boolean(profile.avatarUrl && profile.avatarUrl.trim().length > 0),
    },
    {
      id: "headline",
      label: "Headline",
      completed: Boolean(profile.headline && profile.headline.trim().length > 0),
    },
    {
      id: "education",
      label: "Education Details",
      completed: Boolean(profile.college && profile.college.trim().length > 0),
    },
    {
      id: "skills",
      label: "Key Skills (3+)",
      completed: Boolean(profile.skills && profile.skills.length >= 3),
    },
    {
      id: "about",
      label: "About Me Summary",
      completed: Boolean(profile.aboutMe && profile.aboutMe.trim().length > 0),
    },
    {
      id: "linkedin",
      label: "LinkedIn Profile",
      completed: Boolean(profile.linkedinUrl && profile.linkedinUrl.trim().length > 0),
    },
  ];

  const completedCount = criteria.filter((c) => c.completed).length;
  const totalCount = criteria.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Profile Completion
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete your profile to unlock stronger AI job matches.
          </p>
        </div>
      </div>

      {/* Donut ScoreRing Display */}
      <div className="flex items-center justify-center py-2">
        <ScoreRing
          score={completionPercentage}
          showPercent={true}
          size="lg"
          label={
            completionPercentage === 100
              ? "All Done!"
              : completionPercentage >= 70
              ? "Almost There"
              : "In Progress"
          }
        />
      </div>

      {/* Dynamic Checklist */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {criteria.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs py-1"
          >
            <span
              className={`font-medium ${
                item.completed
                  ? "text-slate-800 dark:text-slate-200"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {item.label}
            </span>
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
