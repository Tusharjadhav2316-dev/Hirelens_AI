"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/shell/TopHeader";
import { ResumeProvider } from "@/contexts/ResumeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Fixed Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area - Placed with lg:pl-64 to accommodate the standard fixed sidebar */}
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden lg:pl-64 transition-all duration-300">
          {/* Top Header */}
          <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <ResumeProvider>
              <div className="mx-auto max-w-7xl h-full">
                {children}
              </div>
            </ResumeProvider>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
