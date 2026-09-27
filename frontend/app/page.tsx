"use client";

import { useState } from "react";
import PublicNav from "@/components/public/PublicNav";
import HeroSection from "@/components/public/HeroSection";
import FeatureGrid from "@/components/public/FeatureGrid";
import HowItWorks from "@/components/public/HowItWorks";
import SocialProofSection from "@/components/public/SocialProofSection";
import FinalCTA from "@/components/public/FinalCTA";
import PublicFooter from "@/components/public/PublicFooter";
import WatchDemoModal from "@/components/public/WatchDemoModal";

export default function Home() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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
