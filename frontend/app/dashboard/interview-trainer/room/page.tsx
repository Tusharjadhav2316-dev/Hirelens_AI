"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InterviewTrainerSession } from "@/types/agent";
import { InterviewRoom } from "@/components/interview-trainer/InterviewRoom";
import { getTrainerSession, deleteTrainerSession } from "@/lib/interviewTrainerSessionService";
import { auth } from "@/lib/firebase";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function InterviewRoomContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("sessionId");

    const [session, setSession] = useState<InterviewTrainerSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setErrorMessage("No interview session ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) {
                    // Give Firebase auth a moment to initialize
                    const unsubscribe = auth.onAuthStateChanged(async (user) => {
                        if (user) {
                            const tok = await user.getIdToken();
                            loadSessionWithToken(tok);
                        } else {
                            setErrorMessage("Authentication required to access interview room.");
                            setIsLoading(false);
                        }
                    });
                    return () => unsubscribe();
                } else {
                    loadSessionWithToken(token);
                }
            } catch (err: any) {
                setErrorMessage(err?.message || "Failed to load interview session.");
                setIsLoading(false);
            }
        };

        const loadSessionWithToken = async (token: string) => {
            try {
                const sessionData = await getTrainerSession(sessionId, token);
                if (!sessionData || !sessionData.session_id) {
                    throw new Error("Interview session not found.");
                }

                setSession(sessionData);
            } catch (err: any) {
                setErrorMessage(err?.message || "Could not retrieve interview session.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    const handleDeleteSession = async () => {
        if (!sessionId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            if (token) {
                await deleteTrainerSession(sessionId, token);
            }
        } catch (_) {}
        router.push("/dashboard/interview-trainer");
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-300 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Entering Interview Room...</p>
            </div>
        );
    }

    if (errorMessage || !session) {
        return (
            <div className="max-w-md mx-auto my-16 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">Session Error</h3>
                <p className="text-xs text-slate-400">{errorMessage || "Session is unavailable."}</p>
                <Link
                    href="/dashboard/interview-trainer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Trainer</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6">
            <InterviewRoom
                initialSession={session}
                onDeleteSession={handleDeleteSession}
            />
        </div>
    );
}

export default function InterviewRoomPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-300">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            }
        >
            <InterviewRoomContent />
        </Suspense>
    );
}
