"use client";

import React from "react";
import { JobResultArtifactData } from "@/types/agent";
import { Target, ExternalLink, AlertTriangle, Building2, MapPin, Sparkles } from "lucide-react";

interface JobResultCardProps {
    data: JobResultArtifactData;
}

export default function JobResultCard({ data }: JobResultCardProps) {
    if (!data) return null;

    const isNotConfigured = data.status === "not_configured";
    const listings = data.listings || [];

    // Case 1: NullJobProvider / not_configured state per wireframe spec
    if (isNotConfigured) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Job Search Provider Not Connected
                    </h3>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <p className="font-semibold mb-1">NullJobProvider Active</p>
                    <p>
                        {data.message ||
                            "Job search API credentials are not configured in this environment. To enable live job search, configure a provider adapter in agent-service/tools/providers/."}
                    </p>
                </div>
            </div>
        );
    }

    // Case 2: Zero results when configured
    if (listings.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                <Target className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No Job Listings Found</p>
                <p className="mt-1">Try broadening your search query or skills filter.</p>
            </div>
        );
    }

    // Case 3: Configured listings array
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Job Opportunities Found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {listings.length} matching job listing{listings.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {listings.map((job, idx) => (
                    <div
                        key={job.id || `job-${idx}`}
                        className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {job.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        {job.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {job.location}
                                    </span>
                                    {job.provider && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                            via {job.provider}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`View job posting for ${job.title} at ${job.company}`}
                                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-medium text-slate-400 mr-1">Relevant skills:</span>
                                {job.skills.map((skill, sIdx) => (
                                    <span
                                        key={sIdx}
                                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
