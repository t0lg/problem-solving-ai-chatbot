"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockProblems, mockIncidents } from "@/lib/mock-data";
import {
  History as HistoryIcon,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const allItems = [
  ...mockProblems.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: "investigation" as const,
    severity: p.severity,
    status: p.status,
    date: p.createdAt,
    category: p.category,
  })),
  ...mockIncidents.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    type: "incident" as const,
    severity: i.severity,
    status: i.status,
    date: i.reportedAt,
    category: i.category,
  })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusIcons: Record<string, React.ReactNode> = {
  resolved: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  in_progress: <Cpu className="h-3.5 w-3.5 text-violet-400" />,
  investigating: <Cpu className="h-3.5 w-3.5 text-violet-400" />,
  analyzing: <Cpu className="h-3.5 w-3.5 text-blue-400" />,
  open: <Clock className="h-3.5 w-3.5 text-amber-400" />,
  draft: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  closed: <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />,
};

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="History"
        description="Browse past investigations and incidents"
        badge={
          <Badge variant="secondary" className="text-[10px]">
            {allItems.length} records
          </Badge>
        }
      >
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort
        </Button>
      </DashboardHeader>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search investigations, incidents, or keywords..."
            className="pl-10 bg-card/40 border-border/50 focus:border-primary/30"
          />
        </div>

        {/* History List */}
        <SectionCard
          title="All Records"
          description="Chronologically ordered"
          icon={<HistoryIcon className="h-4 w-4" />}
        >
          <div className="divide-y divide-border/20">
            {allItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="group flex items-center gap-4 py-3 px-1 transition-colors hover:bg-accent/20 rounded-lg cursor-pointer"
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.type === "investigation"
                      ? "bg-violet-500/10 text-violet-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {item.type === "investigation" ? (
                    <Search className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-[9px] font-medium ${
                        item.type === "investigation"
                          ? "bg-violet-500/10 text-violet-400"
                          : "bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {item.id}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {statusIcons[item.status] || statusIcons.draft}
                    <Badge
                      variant="outline"
                      className="text-[9px] capitalize"
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] capitalize ${
                      item.severity === "critical"
                        ? "border-red-500/30 text-red-400"
                        : item.severity === "high"
                          ? "border-orange-500/30 text-orange-400"
                          : item.severity === "medium"
                            ? "border-amber-500/30 text-amber-400"
                            : "border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {item.severity}
                  </Badge>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
