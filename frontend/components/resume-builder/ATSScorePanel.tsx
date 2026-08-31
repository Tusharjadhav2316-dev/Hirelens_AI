import { useMemo } from "react";
import { ATSAnalysisResult } from "@/lib/atsAnalyzer";
import { AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface ATSScorePanelProps {
    result: ATSAnalysisResult | any;
}

export default function ATSScorePanel({ result }: ATSScorePanelProps) {
    if (!result) return null;

    const overallScore = result.overallScore ?? (result as any).finalScore ?? 0;

    const rawScores = result.sectionScores || {};
    const safeSectionScores = {
        summary: rawScores.summary ?? (result as any).breakdown?.find((b: any) => b.label?.toLowerCase().includes("summary"))?.score ?? overallScore,
        experience: rawScores.experience ?? (result as any).breakdown?.find((b: any) => b.label?.toLowerCase().includes("experience"))?.score ?? overallScore,
        skills: rawScores.skills ?? (result as any).breakdown?.find((b: any) => b.label?.toLowerCase().includes("skills") || b.label?.toLowerCase().includes("keyword"))?.score ?? overallScore,
        projects: rawScores.projects ?? (result as any).breakdown?.find((b: any) => b.label?.toLowerCase().includes("project") || b.label?.toLowerCase().includes("quantification"))?.score ?? overallScore,
        education: rawScores.education ?? (result as any).breakdown?.find((b: any) => b.label?.toLowerCase().includes("education"))?.score ?? overallScore,
    };

    const warnings: string[] = result.warnings || (result as any).flags?.missingKeywords?.map((k: string) => `Missing keyword: ${k}`) || [];
    const suggestions: string[] = result.suggestions || (result as any).flags?.weakVerbs?.map((v: string) => `Consider replacing weak verb: ${v}`) || [];
    const keywordDensityScore = result.keywordDensityScore ?? overallScore;
    const impactScore = result.impactScore ?? overallScore;
    const completenessScore = result.completenessScore ?? overallScore;

    const getColorClass = (score: number) => {
        if (score < 50) return "text-red-500";
        if (score < 75) return "text-amber-400"; // yellow
        return "text-emerald-500"; // green
    };

    const getBgColorClass = (score: number) => {
        if (score < 50) return "bg-red-500";
        if (score < 75) return "bg-amber-400";
        return "bg-emerald-500";
    };

    const getStrokeColor = (score: number) => {
        if (score < 50) return "#ef4444"; // red-500
        if (score < 75) return "#fbbf24"; // amber-400
        return "#10b981"; // emerald-500
    };

    // SVG Circular Progress
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (overallScore / 100) * circumference;

    const sections = [
        { name: "Summary", score: safeSectionScores.summary ?? 0 },
        { name: "Experience", score: safeSectionScores.experience ?? 0 },
        { name: "Skills", score: safeSectionScores.skills ?? 0 },
        { name: "Projects", score: safeSectionScores.projects ?? 0 },
        { name: "Education", score: safeSectionScores.education ?? 0 },
    ];

    const intelligenceSignals = [
        {
            name: "Keyword Integration",
            subtitle: "Skills mentioned in your experience & projects",
            score: keywordDensityScore,
        },
        {
            name: "Impact & Metrics",
            subtitle: "Quantified achievements in your content",
            score: impactScore,
        },
        {
            name: "Profile Completeness",
            subtitle: "Contact info, LinkedIn, certifications",
            score: completenessScore,
        },
    ];

    let bannerText = "";
    let bannerColor = "";
    let bannerIcon = null;

    if (overallScore < 60) {
        bannerText = "Your resume may not pass ATS screening.";
        bannerColor = "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400";
        bannerIcon = <AlertCircle className="w-5 h-5 shrink-0" />;
    } else if (overallScore < 80) {
        bannerText = "Your resume is competitive but can improve.";
        bannerColor = "bg-amber-400/10 border-amber-400/20 text-amber-600 dark:text-amber-400";
        bannerIcon = <AlertCircle className="w-5 h-5 shrink-0" />;
    } else {
        bannerText = "Your resume is well optimized for ATS.";
        bannerColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
        bannerIcon = <CheckCircle2 className="w-5 h-5 shrink-0" />;
    }

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-5">
            {/* Banner */}
            <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 ${bannerColor}`}>
                {bannerIcon}
                <span>{bannerText}</span>
            </div>

            {/* Score Ring & Signals */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            className="text-slate-100 dark:text-slate-800"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            strokeWidth="10"
                            stroke={getStrokeColor(overallScore)}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className={`text-2xl font-black ${getColorClass(overallScore)}`}>
                            {overallScore}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            / 100
                        </span>
                    </div>
                </div>

                <div className="flex-1 w-full space-y-2.5">
                    {intelligenceSignals.map((sig, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{sig.name}</span>
                                <span className={`font-bold ${getColorClass(sig.score)}`}>{sig.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${getBgColorClass(sig.score)}`}
                                    style={{ width: `${sig.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section Breakdown Grid */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Section Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {sections.map((sec, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{sec.name}</span>
                            <span className={`text-sm font-bold ${getColorClass(sec.score)}`}>{sec.score}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warnings & Suggestions */}
            {(warnings.length > 0 || suggestions.length > 0) && (
                <div className="space-y-3 pt-2">
                    {warnings.length > 0 && (
                        <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Items Needing Attention ({warnings.length})
                            </h5>
                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                                {warnings.slice(0, 4).map((w: string, i: number) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {suggestions.length > 0 && (
                        <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5" /> Recommendations ({suggestions.length})
                            </h5>
                            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                                {suggestions.slice(0, 4).map((s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
