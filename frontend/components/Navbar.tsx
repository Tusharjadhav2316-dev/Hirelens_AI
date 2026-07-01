"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Helper to get initials
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-10 w-full transition-colors duration-300">
            {/* Mobile Menu Button - Left Side */}
            <div className="flex items-center lg:hidden">
                <button
                    onClick={onMenuClick}
                    type="button"
                    className="p-2 -ml-2 mr-2 text-gray-400 hover:text-gray-500 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                >
                    <span className="sr-only">Toggle sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>

            {/* Right Side - Actions & Profile */}
            <div className="flex items-center gap-3 ml-auto">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <button
                    type="button"
                    className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {/* Notification Badge indicator */}
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        className="flex items-center gap-2 max-w-xs rounded-full bg-white dark:bg-slate-800 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 p-1 pr-3 shadow-sm border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 transition-colors"
                        id="user-menu-button"
                        aria-expanded={isProfileOpen}
                        aria-haspopup="true"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-white dark:ring-slate-900">
                            {user?.photoURL ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={user.photoURL}
                                    alt={user?.displayName || "User avatar"}
                                />
                            ) : (
                                getInitials(user?.displayName)
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                            {user?.displayName || "Loading..."}
                        </span>
                    </button>

                    {/* Dropdown Menu (Simplified implementation) */}
                    {isProfileOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsProfileOpen(false)}
                            />

                            <div
                                className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700 transform transition-all duration-200 ease-out"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabIndex={-1}
                            >
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user?.displayName || "User"}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {user?.email || ""}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <a
                                        href="/dashboard/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                        role="menuitem"
                                        tabIndex={-1}
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        Your Profile
                                    </a>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleSignOut();
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        role="menuitem"
                                        tabIndex={-1}
                                    >
                                        <LogOut className="h-4 w-4 text-red-500" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
