"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="relative flex items-center justify-center">
                    {/* Abstract background glow */}
                    <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                    Authenticating...
                </p>
            </div>
        );
    }

    // If authenticated, render the children
    if (user) {
        return <>{children}</>;
    }

    // Fallback: render nothing if not authenticated and not loading (will be redirected)
    return null;
}
