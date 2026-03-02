"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentHistory, deleteHistoryItem, ActivityHistoryItem } from "@/lib/historyService";
import { Clock, Trash2, ArrowRight, FileText, BarChart, Briefcase, Mail, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getRecentHistory(user.uid);
            setHistory(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadHistory();
    }, [user]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        setDeletingId(id);

        try {
            await deleteHistoryItem(user.uid, id);
            setHistory(prev => prev.filter(item => item.id !== id));
            toast.success("Activity removed.");
        } catch (error) {
            toast.error("Failed to delete activity.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleView = (item: ActivityHistoryItem) => {
        switch (item.type) {
            case "resume":
                router.push(`/dashboard/builder?historyId=${item.id}`);
                break;
            case "ats-analysis":
                router.push(`/dashboard/resume-analyzer?historyId=${item.id}`);
                break;
            case "job-match":
                router.push(`/dashboard/job-matcher?historyId=${item.id}`);
                break;
            case "cover-letter":
                router.push(`/dashboard/cover-letter?historyId=${item.id}`);
                break;
        }
    };

    const getTypeDetails = (type: ActivityHistoryItem['type']) => {
        switch (type) {
            case "resume": return { icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Resume Built" };
            case "ats-analysis": return { icon: BarChart, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", label: "ATS Analysis" };
            case "job-match": return { icon: Briefcase, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Job Match" };
            case "cover-letter": return { icon: Mail, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Cover Letter" };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p className="font-medium animate-pulse">Loading your activity history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        Activity History
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        Your resume activities from the past 7 days.
                    </p>
                </div>
                <button
                    onClick={loadHistory}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Refresh history"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Recent Activity</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                        Build a resume, run an ATS analyzer, or map to a job. Your actions will automatically save here for 7 days.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {history.map((item) => {
                        const { icon: Icon, color, bg, label } = getTypeDetails(item.type);
                        const createdDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
                        const expiresDate = item.expiresAt?.toDate ? item.expiresAt.toDate() : new Date(Date.now() + 7 * 86400000);
                        const expiresIn = formatDistanceToNow(expiresDate);

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleView(item)}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer relative flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${bg}`}>
                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        disabled={deletingId === item.id}
                                        className="text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate pr-6">
                                    {item.title}
                                </h3>

                                <div className="flex flex-col gap-1.5 mb-4">
                                    {item.metadata?.company && (
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                            {item.metadata.company} {item.metadata.jobTitle && `— ${item.metadata.jobTitle}`}
                                        </div>
                                    )}
                                    {item.metadata?.score !== undefined && (
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            Score: <span className={item.metadata.score >= 80 ? 'text-emerald-500' : item.metadata.score >= 60 ? 'text-amber-500' : 'text-red-500'}>{item.metadata.score}%</span>
                                        </div>
                                    )}
                                </div>

                                {item.contentSnapshot && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow font-serif italic border-l-2 border-slate-200 dark:border-slate-800 pl-3">
                                        "{item.contentSnapshot.replace(/\n/g, ' ')}"
                                    </p>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400">Created: {createdDate.toLocaleDateString()}</span>
                                        <span className="text-amber-600 dark:text-amber-500 font-semibold text-[10px]">Expires in {expiresIn}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform">
                                        View <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
