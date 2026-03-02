"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    FileEdit,
    Search,
    Target,
    Mail,
    History,
    Settings,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Builder", href: "/dashboard/builder", icon: FileEdit },
    { name: "Resume Analyzer", href: "/dashboard/resume-analyzer", icon: Search },
    { name: "Job Matcher", href: "/dashboard/job-matcher", icon: Target },
    { name: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
    { name: "Resume History", href: "/dashboard/history", icon: History },
];

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    // Sidebar is fully expanded if it's explicitly opened on mobile, or hovered on desktop
    const isExpanded = isOpen || isHovered;

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen?.(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out",
                    // Mobile Drawer Classes
                    isOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full w-64",
                    // Desktop Classes
                    "lg:translate-x-0",
                    isHovered
                        ? "lg:w-64 lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:lg:shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
                        : "lg:w-16 lg:shadow-none"
                )}
                aria-expanded={isExpanded}
            >
                {/* Logo Area */}
                <div className={cn(
                    "flex h-16 items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300",
                    isExpanded ? "justify-between px-4" : "justify-center px-4 lg:px-0"
                )}>
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-3 transition-opacity hover:opacity-90 overflow-hidden",
                            !isExpanded && "lg:justify-center lg:w-full"
                        )}
                    >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-blue-600/20">
                            HL
                        </div>
                        <span
                            className={cn(
                                "text-xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap transition-all duration-300",
                                !isExpanded ? "lg:hidden lg:opacity-0 lg:w-0" : "opacity-100"
                            )}
                        >
                            HireLens <span className="text-blue-600 dark:text-blue-500">AI</span>
                        </span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen?.(false)}
                        className={cn(
                            "p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md transition-opacity",
                            isExpanded ? "lg:hidden" : "hidden"
                        )}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-1 custom-scrollbar",
                    isExpanded ? "px-3" : "px-3 lg:px-2"
                )}>
                    <div
                        className={cn(
                            "text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap",
                            isExpanded ? "px-3 opacity-100" : "lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden px-3"
                        )}
                    >
                        Menu
                    </div>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!isExpanded ? item.name : undefined}
                                className={cn(
                                    "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                    isExpanded ? "px-3" : "px-3 lg:px-0 lg:justify-center",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "whitespace-nowrap transition-all duration-300",
                                        !isExpanded ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
                                    )}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    <div
                        className={cn(
                            "mt-8 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap",
                            isExpanded ? "px-3 opacity-100" : "lg:opacity-0 lg:h-0 lg:mt-0 lg:mb-0 lg:overflow-hidden px-3"
                        )}
                    >
                        Preferences
                    </div>
                    <Link
                        href="/dashboard/settings"
                        title={!isExpanded ? "Profile Settings" : undefined}
                        className={cn(
                            "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                            isExpanded ? "px-3" : "px-3 lg:px-0 lg:justify-center",
                            pathname === "/dashboard/settings"
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <Settings
                            className={cn(
                                "w-5 h-5 flex-shrink-0 transition-colors",
                                pathname === "/dashboard/settings"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            )}
                        />
                        <span
                            className={cn(
                                "whitespace-nowrap transition-all duration-300",
                                !isExpanded ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
                            )}
                        >
                            Profile Settings
                        </span>
                    </Link>
                </div>

                {/* Bottom Upgrade/Quota Section */}
                <div
                    className={cn(
                        "p-4 border-t border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden",
                        !isExpanded ? "lg:h-0 lg:p-0 lg:opacity-0 lg:border-none" : "h-auto opacity-100"
                    )}
                >
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-blue-100/50 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl -mr-4 -mt-4 mix-blend-multiply dark:mix-blend-plus-lighter" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 relative z-10 whitespace-nowrap">Pro Plan</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 relative z-10 whitespace-normal line-clamp-2">
                            Unlock advanced AI keywords and unlimited ATS scans.
                        </p>
                        <button className="w-full text-xs font-semibold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-sm relative z-10">
                            Upgrade
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
