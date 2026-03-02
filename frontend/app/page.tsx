"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // While deciding the route, show a beautiful, minimal full-page loader
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-1000">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
          HireLens AI
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Securing your session...
        </p>
      </div>
    </div>
  );
}
