import React from "react";
import Link from "next/link";
import { History, Play, CheckCircle, Clock, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { InterviewTrainerSession } from "@/types/agent";

interface RecentSessionsListProps {
  sessions: InterviewTrainerSession[];
  loading: boolean;
  deletingId: string | null;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onStartNew: () => void;
}

export default function RecentSessionsList({
  sessions,
  loading,
  deletingId,
  onDeleteSession,
  onStartNew,
}: RecentSessionsListProps) {
  const getScoreBadge = (session: InterviewTrainerSession) => {
    // If the session has a final report with overall_score
    const reportScore = session.final_report?.overall_score || session.final_report?.score;
    if (typeof reportScore === "number") {
      const color =
        reportScore >= 80
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
          : reportScore >= 60
          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
          {reportScore}% Score
        </span>
      );
    }

    if (session.status === "completed") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
          Completed
        </span>
      );
    }

    if (session.status === "in_progress") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300">
          In Progress
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Setup
      </span>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Recent Practice Sessions
          </h2>
        </div>
        {sessions.length > 0 && (
          <span className="text-xs text-slate-400">
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <p className="text-xs">Loading training history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No practice sessions yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Complete your first AI interview above to see real-time score analytics and coaching history.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition cursor-pointer"
          >
            <span>Start First Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.session_id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {session.target_role}
                  </h4>
                  {getScoreBadge(session)}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="capitalize">{session.interview_type}</span>
                  <span>•</span>
                  <span className="capitalize">{session.difficulty}</span>
                  <span>•</span>
                  <span>{session.answers_given?.length || 0} questions answered</span>
                  <span>•</span>
                  <span>{session.created_at ? new Date(session.created_at).toLocaleDateString() : ""}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Link
                  href={`/dashboard/interview-trainer/room?sessionId=${encodeURIComponent(session.session_id)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
                >
                  <span>{session.status === "completed" ? "View Report" : "Resume"}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={(e) => onDeleteSession(session.session_id, e)}
                  disabled={deletingId === session.session_id}
                  aria-label="Delete session"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer disabled:opacity-50"
                >
                  {deletingId === session.session_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
