"use client";

import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import type { SimilarIncident } from "@/types/incident";
import { GitCompare, ExternalLink } from "lucide-react";

interface SimilarIncidentsCardProps {
  incidents: SimilarIncident[];
  className?: string;
}

export function SimilarIncidentsCard({
  incidents,
  className,
}: SimilarIncidentsCardProps) {
  return (
    <SectionCard
      title="Benzer Olaylar"
      description={`${incidents.length} eşleşme bulundu`}
      icon={<GitCompare className="h-4 w-4" />}
      className={className}
      glow
    >
      <div className="space-y-2">
        {incidents.map((item) => (
          <button
            key={item.incident.id}
            className="group flex w-full flex-col gap-2 rounded-lg border border-transparent p-3 text-left transition-all hover:border-border/50 hover:bg-accent/40"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                {item.incident.title}
              </p>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100" />
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.incident.description}
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {item.matchedKeywords.slice(0, 3).map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="h-4 rounded-sm px-1 text-[9px] font-medium border-primary/20 text-primary/80"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>

              {/* Similarity score bar */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.similarityScore >= 0.8
                        ? "bg-emerald-500"
                        : item.similarityScore >= 0.6
                          ? "bg-amber-500"
                          : "bg-orange-500"
                    )}
                    style={{ width: `${item.similarityScore * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {Math.round(item.similarityScore * 100)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
