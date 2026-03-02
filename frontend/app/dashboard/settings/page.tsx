"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, uploadAvatar, deleteUserAccount, UserProfile } from "@/lib/profileService";
import { useTheme } from "@/components/ThemeProvider";
import { Camera, Mail, User, Save, Trash2, Loader2, Moon, Sun, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [fullName, setFullName] = useState("");
    const [defaultTemplate, setDefaultTemplate] = useState("professional");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        getUserProfile(user.uid).then(p => {
            if (p) {
                setProfile(p);
                setFullName(p.fullName);
                setDefaultTemplate(p.defaultTemplate || "professional");
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, {
                fullName,
                defaultTemplate
            });
            toast.success("Profile saved successfully");
        } catch (error) {
            toast.error("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || (!e.target.files || e.target.files.length === 0)) return;

        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadAvatar(user.uid, file);
            setProfile(prev => prev ? { ...prev, avatarUrl: url } : null);
            toast.success("Avatar updated successfully");
        } catch (error) {
            toast.error("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        const confirmDelete = window.confirm(
            "Are you absolutely sure you want to delete your account? This will permanently erase your profile, all resumes, and data. This action cannot be undone."
        );

        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await deleteUserAccount(user.uid);
            toast.success("Account deleted successfully");
            router.push("/login");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account. You may need to sign in again to perform this sensitive action.");
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    Manage your personal information, preferences, and account security.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Profile */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="relative w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                        {profile?.avatarUrl ? (
                                            <Image src={profile.avatarUrl} alt="Current Avatar" fill className="object-cover" unoptimized />
                                        ) : (
                                            <User className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {fullName || "User"}
                                    </span>
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    <div className="space-y-1 text-center sm:text-left">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Avatar</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Select a new profile picture from our collection.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                                        {[
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Luna&backgroundColor=ffd5dc",
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Oliver&backgroundColor=c0aede",
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Avery&backgroundColor=d1d4f9",
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Jack&backgroundColor=ffdfbf",
                                            "https://api.dicebear.com/9.x/notionists/svg?seed=Chloe&backgroundColor=b6e3f4"
                                        ].map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setProfile(prev => prev ? { ...prev, avatarUrl: url } : null)}
                                                className={`relative w-full aspect-square rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${profile?.avatarUrl === url
                                                    ? "border-blue-500 ring-4 ring-blue-500/20 scale-110 shadow-md"
                                                    : "border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100"
                                                    }`}
                                            >
                                                <Image src={url} alt={`Avatar Option ${idx + 1}`} fill className="object-cover" unoptimized />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800/60" />

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-transparent rounded-lg text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                        Your email address is managed directly by your sign-in provider.
                                    </p>
                                </div>
                            </div>

                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 px-6 md:px-8 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving || !fullName.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preferences & Danger Zone */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Preferences</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Theme Preference</label>
                                <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl flex">
                                    <button
                                        onClick={toggleTheme}
                                        className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Sun className="w-4 h-4" /> Light
                                    </button>
                                    <button
                                        onClick={toggleTheme}
                                        className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        <Moon className="w-4 h-4" /> Dark
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Template</label>
                                <select
                                    value={defaultTemplate}
                                    onChange={e => setDefaultTemplate(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                                >
                                    <option value="professional">Professional (Harvard/Standard)</option>
                                    <option value="modern">Modern (Clean & Bold)</option>
                                    <option value="creative">Creative (Design-focused)</option>
                                </select>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Determines the template used when you create a new resume.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5" /> Danger Zone
                        </h2>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                            Permanently delete your account and remove all data from our servers. This action is irreversible.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {isDeleting ? "Deleting Account..." : "Delete Account"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
