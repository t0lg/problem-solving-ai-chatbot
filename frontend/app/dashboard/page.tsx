"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { mockIncidents, mockProblems } from "@/lib/mock-data";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";

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

const stats = [
  {
    label: "Aktif İncelemeler",
    value: "12",
    change: "bu hafta +3",
    trend: "up" as const,
    icon: <Activity className="h-4 w-4" />,
    color: "from-violet-500/20 to-violet-500/5 text-violet-400",
  },
  {
    label: "Bugün Çözülenler",
    value: "5",
    change: "ort. %25 ↑",
    trend: "up" as const,
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
  },
  {
    label: "Ort. Çözüm Süresi",
    value: "4.2s",
    change: "geçen aya göre -%18",
    trend: "down" as const,
    icon: <Clock className="h-4 w-4" />,
    color: "from-blue-500/20 to-blue-500/5 text-blue-400",
  },
  {
    label: "Kritik Sorunlar",
    value: "2",
    change: "Dikkat gerektiriyor",
    trend: "alert" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "from-red-500/20 to-red-500/5 text-red-400",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="Kontrol Paneli"
        description="Problem çözme operasyonlarınıza genel bakış"
        badge={
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 text-emerald-400 text-[10px]"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Canlı
          </Badge>
        }
      />

      <div className="p-6 space-y-6">
        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm transition-all hover:border-border/80 hover:bg-card/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-5 blur-2xl transition-opacity group-hover:opacity-10 from-white to-transparent" />
            </div>
          ))}
        </div>

        {/* ── Content Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Problems */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Son İncelemeler"
              description="Analiz için gönderilen son problemler"
              icon={<BarChart3 className="h-4 w-4" />}
              headerAction={
                <Badge variant="secondary" className="text-[10px]">
                  {mockProblems.length} toplam
                </Badge>
              }
            >
              <div className="space-y-2">
                {mockProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between rounded-lg border border-border/30 p-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          problem.severity === "critical"
                            ? "bg-red-500/15 text-red-400"
                            : problem.severity === "high"
                              ? "bg-orange-500/15 text-orange-400"
                              : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {problem.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {problem.id}
                          </span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[11px] text-muted-foreground">
                            {problem.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          problem.status === "in_progress"
                            ? "border-violet-500/30 text-violet-400"
                            : problem.status === "analyzing"
                              ? "border-blue-500/30 text-blue-400"
                              : "border-muted"
                        }`}
                      >
                        {statusTranslations[problem.status] || problem.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Quick Insights */}
          <SectionCard
            title="YZ İçgörüleri"
            description="Otomatik örüntü algılama"
            icon={<TrendingUp className="h-4 w-4" />}
            glow
          >
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">
                    Yükselen Örüntü
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Motor aşırı ısınma olayları bu çeyrekte %40 arttı.
                  3. Çeyrekteki bakım programı değişiklikleri ile korelasyon gösteriyor.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Öne Çıkan Kategoriler
                </p>
                {[
                  { name: "Mekanik", count: 42, pct: 85 },
                  { name: "Elektrik", count: 28, pct: 60 },
                  { name: "Proses", count: 19, pct: 40 },
                  { name: "Kalite", count: 11, pct: 25 },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-mono text-muted-foreground/70">
                        {cat.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Active Incidents ───────────────────────────────────── */}
        <SectionCard
          title="Aktif Olaylar"
          description="İlgi gerektiren olaylar"
          icon={<AlertTriangle className="h-4 w-4" />}
          headerAction={
            <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
              {mockIncidents.filter((i) => i.status !== "resolved" && i.status !== "closed").length}{" "}
              açık
            </Badge>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="pb-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Olay
                  </th>
                  <th className="pb-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Kategori
                  </th>
                  <th className="pb-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Önem Derecesi
                  </th>
                  <th className="pb-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Durum
                  </th>
                  <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Konum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {mockIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="transition-colors hover:bg-accent/20"
                  >
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-sm font-medium">{incident.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {incident.id}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {incident.category}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          incident.severity === "critical"
                            ? "border-red-500/30 text-red-400"
                            : incident.severity === "high"
                              ? "border-orange-500/30 text-orange-400"
                              : incident.severity === "medium"
                                ? "border-amber-500/30 text-amber-400"
                                : "border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {severityTranslations[incident.severity] || incident.severity}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize ${
                          incident.status === "open"
                            ? "bg-blue-500/15 text-blue-400"
                            : incident.status === "investigating"
                              ? "bg-violet-500/15 text-violet-400"
                              : incident.status === "resolved"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusTranslations[incident.status] || incident.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {incident.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
