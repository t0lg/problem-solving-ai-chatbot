"use client";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProblemStore } from "@/store/useProblemStore";
import { mockIncidents } from "@/lib/mock-data";
import {
  LayoutDashboard,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Brain,
  Zap,
} from "lucide-react";
import { useState } from "react";

const severityColors: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400",
  investigating: "bg-violet-500/15 text-violet-400",
  resolved: "bg-emerald-500/15 text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const isSidebarOpen = useProblemStore((s) => s.isSidebarOpen);

  if (!isSidebarOpen) return null;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[280px]"
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Brain className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">
                ResolveAI
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Problem Intelligence
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {/* ── Navigation ─────────────────────────────────────────── */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Navigation
            </p>
          )}
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/investigation"
            icon={<Search className="h-4 w-4" />}
            label="Investigations"
            badge={2}
            collapsed={collapsed}
          />
          <SidebarItem
            href="/history"
            icon={<History className="h-4 w-4" />}
            label="History"
            collapsed={collapsed}
          />
        </div>

        <Separator className="my-4 bg-border/50" />

        {/* ── Recent Incidents ────────────────────────────────────── */}
        {!collapsed && (
          <div>
            <div className="mb-3 flex items-center justify-between px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Recent Incidents
              </p>
              <Zap className="h-3 w-3 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              {mockIncidents.slice(0, 5).map((incident) => (
                <button
                  key={incident.id}
                  className="group flex w-full flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-accent/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          incident.severity === "critical"
                            ? "text-red-400"
                            : incident.severity === "high"
                              ? "text-orange-400"
                              : incident.severity === "medium"
                                ? "text-amber-400"
                                : "text-emerald-400"
                        )}
                      />
                      <span className="truncate text-xs font-medium text-foreground/90 group-hover:text-foreground">
                        {incident.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pl-5.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-4 rounded-sm border px-1 text-[9px] font-medium",
                        severityColors[incident.severity]
                      )}
                    >
                      {incident.severity}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-4 rounded-sm px-1 text-[9px] font-medium",
                        statusColors[incident.status]
                      )}
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="border-t border-border/50 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-indigo-500/10 px-3 py-2.5 border border-violet-500/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-violet-300">AI Engine Active</p>
              <p className="text-[10px] text-violet-400/60">v2.4.1 · Ready</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
