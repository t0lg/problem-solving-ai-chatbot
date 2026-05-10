"use client";

import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import type { Methodology } from "@/types/methodology";
import { useProblemStore } from "@/store/useProblemStore";
import {
  HelpCircle,
  GitBranch,
  ShieldAlert,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

const iconMap: Record<string, ReactNode> = {
  "help-circle": <HelpCircle className="h-4 w-4" />,
  "git-branch": <GitBranch className="h-4 w-4" />,
  "shield-alert": <ShieldAlert className="h-4 w-4" />,
  "clipboard-list": <ClipboardList className="h-4 w-4" />,
};

interface MethodologyCardProps {
  methodology: Methodology;
  isSelected?: boolean;
  compact?: boolean;
}

export function MethodologyCard({
  methodology,
  isSelected = false,
  compact = false,
}: MethodologyCardProps) {
  const selectMethodology = useProblemStore((s) => s.selectMethodology);

  if (compact) {
    return (
      <button
        onClick={() => selectMethodology(methodology)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200",
          "border border-transparent hover:border-border/60 hover:bg-accent/50",
          isSelected && "border-primary/30 bg-primary/5"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            isSelected
              ? "border-primary/30 bg-primary/15 text-primary"
              : "border-border/50 bg-muted/50 text-muted-foreground group-hover:text-foreground"
          )}
        >
          {iconMap[methodology.icon] || <HelpCircle className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{methodology.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {methodology.steps.length} adım
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
      </button>
    );
  }

  return (
    <SectionCard
      title={methodology.name}
      description={methodology.description}
      icon={iconMap[methodology.icon]}
      className={cn(isSelected && "border-primary/30 ring-1 ring-primary/10")}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {methodology.applicability.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-1.5">
          {methodology.steps.slice(0, 3).map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/60 text-[9px] font-bold">
                {step.order}
              </div>
              {step.title}
            </div>
          ))}
          {methodology.steps.length > 3 && (
            <p className="pl-6 text-[11px] text-muted-foreground/60">
              +{methodology.steps.length - 3} adım daha
            </p>
          )}
        </div>
        <button
          onClick={() => selectMethodology(methodology)}
          className={cn(
            "w-full rounded-lg py-2 text-xs font-semibold transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-accent hover:bg-accent/80 text-foreground"
          )}
        >
          {isSelected ? "Seçildi" : "Metodoloji Seç"}
        </button>
      </div>
    </SectionCard>
  );
}
