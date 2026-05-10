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
  Activity,
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
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4" />,
  analyzing: <Activity className="h-4 w-4" />,
  in_progress: <Activity className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  closed: <CheckCircle2 className="h-4 w-4" />,
  investigating: <Cpu className="h-4 w-4" />,
  open: <Clock className="h-4 w-4" />,
};

const severityTranslations: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Kritik",
};

const statusTranslations: Record<string, string> = {
  open: "Açık",
  investigating: "İnceleniyor",
  resolved: "Çözüldü",
  closed: "Kapalı",
  in_progress: "Devam Ediyor",
  analyzing: "Analiz Ediliyor",
  draft: "Taslak"
};

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="Geçmiş"
        description="Geçmiş incelemelere ve olaylara göz atın"
        badge={
          <Badge variant="secondary" className="text-[10px]">
            {allItems.length} kayıt
          </Badge>
        }
      >
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Filtrele
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sırala
        </Button>
      </DashboardHeader>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="İncelemelerde, olaylarda veya anahtar kelimelerde ara..."
            className="pl-10 bg-card/40 border-border/50 focus:border-primary/30"
          />
        </div>

        {/* History List */}
        <SectionCard
          title="Tüm Kayıtlar"
          description="Kronolojik olarak sıralandı"
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
                      {item.type === "investigation" ? "inceleme" : "olay"}
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
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {statusIcons[item.status] || statusIcons.draft}
                    <span className="capitalize">
                      {statusTranslations[item.status] || item.status.replace("_", " ")}
                    </span>
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
                    {severityTranslations[item.severity] || item.severity}
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
