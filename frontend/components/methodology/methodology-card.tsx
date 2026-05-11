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
  const currentStep = useProblemStore((s) => s.currentStep);

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
        
        {isSelected && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-primary">
              <span>İlerleme</span>
              <span>{Math.round((currentStep / methodology.steps.length) * 100)}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (currentStep / methodology.steps.length) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {methodology.steps.slice(0, Math.max(3, currentStep)).map((step) => {
            const isActive = isSelected && step.order === currentStep;
            const isPast = isSelected && step.order < currentStep;
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  isActive ? "text-primary font-bold" : isPast ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                  isActive ? "border-primary bg-primary/10" : "border-border/60"
                )}>
                  {step.order}
                </div>
                {step.title}
              </div>
            );
          })}
          {methodology.steps.length > Math.max(3, currentStep) && (
            <p className="pl-6 text-[11px] text-muted-foreground/60">
              +{methodology.steps.length - Math.max(3, currentStep)} adım daha
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
