import { useMemo } from "react";
import { ATSAnalysisResult } from "@/lib/atsAnalyzer";
import { AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface ATSScorePanelProps {
    result: ATSAnalysisResult;
}

export default function ATSScorePanel({ result }: ATSScorePanelProps) {
    const { overallScore, sectionScores, warnings, suggestions } = result;

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
        { name: "Summary", score: sectionScores.summary },
        { name: "Experience", score: sectionScores.experience },
        { name: "Skills", score: sectionScores.skills },
        { name: "Projects", score: sectionScores.projects },
        { name: "Education", score: sectionScores.education },
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
        <div className="w-[320px] shrink-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">

            <div className="mb-6 flex flex-col items-center relative">
                <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke={getStrokeColor(overallScore)}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-4xl font-bold ${getColorClass(overallScore)}`}>
                        {overallScore}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="mt-4 text-center font-semibold text-slate-700 dark:text-slate-200">
                    ATS Compatibility Score
                </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start gap-3 mb-6 ${bannerColor}`}>
                {bannerIcon}
                <p className="text-sm font-medium leading-snug">{bannerText}</p>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 px-1">Section Breakdown</h3>
                <div className="space-y-3">
                    {sections.map((sec) => (
                        <div key={sec.name}>
                            <div className="flex justify-between text-xs mb-1 px-1">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{sec.name}</span>
                                <span className={`font-semibold ${getColorClass(sec.score)}`}>{sec.score}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBgColorClass(sec.score)}`}
                                    style={{ width: `${Math.max(0, Math.min(100, sec.score))}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3 px-1">
                        <AlertCircle className="w-4 h-4" />
                        Critical Warnings
                    </h3>
                    <ul className="space-y-2">
                        {warnings.map((warning, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-snug flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{warning}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-3 px-1">
                        <Lightbulb className="w-4 h-4" />
                        Suggestions to Improve
                    </h3>
                    <ul className="space-y-2">
                        {suggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-snug flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}
