import React from "react";
import { Code2, Users, BrainCircuit, Building2, Sparkles, CheckCircle2 } from "lucide-react";

export type InterviewTypeOption = "technical" | "behavioral" | "aptitude" | "company_specific" | "custom";

interface InterviewTypeGridProps {
  selectedType: InterviewTypeOption;
  onSelectType: (type: InterviewTypeOption) => void;
}

const interviewTypes: {
  id: InterviewTypeOption;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "technical",
    title: "Technical",
    subtitle: "Architecture patterns, system design, code algorithms, and technical trade-offs.",
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "behavioral",
    title: "HR & Behavioral",
    subtitle: "STAR framework scenarios, culture alignment, conflict resolution, and leadership.",
    icon: Users,
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "aptitude",
    title: "Aptitude & Logic",
    subtitle: "Quantitative problem breakdown, case estimation, and cognitive reasoning puzzles.",
    icon: BrainCircuit,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "company_specific",
    title: "Company Specific",
    subtitle: "Targeted rubrics for FAANG, tier-1 tech startups, and top product firms.",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "custom",
    title: "Custom / Role-Specific",
    subtitle: "Dynamic AI competency decomposition for any custom profession or job description.",
    icon: Sparkles,
    color: "from-indigo-600 to-purple-600",
  },
];

export default function InterviewTypeGrid({
  selectedType,
  onSelectType,
}: InterviewTypeGridProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Interview Type
        </h2>
        <span className="text-xs text-slate-400">
          Choose a tailored evaluation rubric
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {interviewTypes.map((type) => {
          const isSelected = selectedType === type.id;
          const Icon = type.icon;

          return (
            <div
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-500/40"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${type.color} text-white flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {type.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {type.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
