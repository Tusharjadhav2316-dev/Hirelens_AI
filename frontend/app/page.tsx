"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import HeroSection from "@/components/public/HeroSection";
import FeatureGrid from "@/components/public/FeatureGrid";
import HowItWorks from "@/components/public/HowItWorks";
import SocialProofSection from "@/components/public/SocialProofSection";
import FinalCTA from "@/components/public/FinalCTA";
import PublicFooter from "@/components/public/PublicFooter";
import WatchDemoModal from "@/components/public/WatchDemoModal";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/agent");
    }
  }, [user, loading, router]);

  // While checking auth status, show minimal loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-200">
            HireLens AI
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Securing your session...
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in, show redirecting state while effect executes
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated visitor -> Render Landing Page V2 Visual Blueprint
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. Translucent Sticky Glass Navbar */}
      <PublicNav />

      {/* Main Continuous Flow Experience */}
      <main className="flex-1">
        {/* 2. Full-Bleed Cinematic Hero with Bottom White Wave */}
        <HeroSection onWatchDemo={() => setDemoModalOpen(true)} />

        {/* 3. Feature Section with Bottom Navy Wave */}
        <FeatureGrid />

        {/* 4. Dark How-It-Works Section with Bottom White Wave */}
        <HowItWorks />

        {/* 5. Testimonial / Social Proof Section */}
        <SocialProofSection />

        {/* 6. Final Cinematic CTA */}
        <FinalCTA />
      </main>

      {/* 7. Full-Width SaaS Footer */}
      <PublicFooter />

      {/* Watch Demo Modal */}
      <WatchDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}
