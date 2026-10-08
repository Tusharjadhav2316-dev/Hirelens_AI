"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentHistory, deleteHistoryItem, ActivityHistoryItem } from "@/lib/historyService";
import { Clock, X, Trash2, ArrowRight, FileText, CheckCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (item: ActivityHistoryItem) => void;
}

export default function HistoryDrawer({ isOpen, onClose, onSelectHistory }: HistoryDrawerProps) {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<ActivityHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getRecentHistory(user.uid);
      const atsItems = data.filter((item) => item.type === "ats-analysis");
      setHistoryItems(atsItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeletingId(id);
    try {
      await deleteHistoryItem(user.uid, id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Analysis removed from history.");
    } catch (err) {
      toast.error("Failed to delete analysis.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analysis History</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Past ATS scan snapshots (last 7 days)</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Loading history...</span>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No ATS scans saved yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Run an analysis above to automatically save snapshots here.</p>
              </div>
            ) : (
              historyItems.map((item) => {
                const score = item.metadata?.score ?? null;
                const formattedDate = item.createdAt?.toDate
                  ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
                  : "Recently";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="group relative p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 hover:bg-indigo-50/40 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title || "ATS Analysis"}
                          </h4>
                          {score !== null && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                score >= 80
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : score >= 60
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                              }`}
                            >
                              Score: {score}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formattedDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={deletingId === item.id}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
