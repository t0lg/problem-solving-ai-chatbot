"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { InsightsPanel } from "@/components/layout/insights-panel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProblemStore } from "@/store/useProblemStore";
import { PanelRight, Menu } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    isInsightsPanelOpen,
    toggleInsightsPanel,
    isSidebarOpen,
    toggleSidebar,
  } = useProblemStore();

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar for mobile toggles */}
          <div className="flex h-14 items-center justify-between border-b border-border/50 px-4 lg:px-6">
            <div className="flex items-center gap-2">
              {!isSidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Çalışma Alanı</span>
                <span>/</span>
                <span>İnceleme</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isInsightsPanelOpen && (
                <button
                  onClick={toggleInsightsPanel}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title="İçgörü Panelini Göster"
                >
                  <PanelRight className="h-4 w-4" />
                </button>
              )}

              {/* User avatar placeholder */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                BC
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </main>

        {/* Right Insights Panel */}
        <InsightsPanel />
      </div>
    </TooltipProvider>
  );
}
