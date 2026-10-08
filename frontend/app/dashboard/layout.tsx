"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/shell/TopHeader";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Fixed Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content Area - Synchronously offsets by 256px (lg:pl-64) or 80px (lg:pl-20) */}
        <div
          className={cn(
            "flex-1 flex flex-col w-full h-full overflow-hidden transition-all duration-200 ease-in-out",
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
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

