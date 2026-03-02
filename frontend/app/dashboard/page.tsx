"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, FileText, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();

    // Quick action cards placeholder data
    const quickActions = [
        {
            title: "Create New Resume",
            description: "Start from scratch or use AI to build an ATS-optimized resume.",
            icon: PlusCircle,
            href: "/dashboard/builder",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Analyze Resume",
            description: "Upload an existing resume to get an instant ATS compatibility score.",
            icon: TrendingUp,
            href: "/dashboard/resume-analyzer",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            title: "Generate Cover Letter",
            description: "Create a tailored cover letter matched to a specific job description.",
            icon: Sparkles,
            href: "/dashboard/cover-letter",
            bg: "bg-purple-50 dark:bg-purple-500/10",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Welcome back, {user?.displayName?.split(" ")[0] || "User"}
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Here's what's happening with your job applications today.
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                    <div
                        key={index}
                        className="relative group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.bg}`}>
                            <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {action.description}
                        </p>
                        <Link
                            href={action.href}
                            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-1 transition-transform"
                        >
                            Get started
                            <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Recent Resumes Placeholder Area */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Resumes
                    </h2>
                    <Link href="/dashboard/history" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        View all
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No resumes yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Get started by creating your first ATS-optimized resume or uploading an existing one for analysis.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <Link
                                href="/dashboard/builder"
                                className="inline-flex h-9 items-center justify-center rounded-md bg-transparent border border-gray-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Start from scratch
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
