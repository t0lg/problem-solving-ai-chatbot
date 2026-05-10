"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { InvestigationStep, InvestigationStepStatus } from "@/types/problem";
import {
  MessageSquare,
  Brain,
  GitBranch,
  Target,
  ListChecks,
  Search,
  BookOpen,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";

// ── Step Icon Map ───────────────────────────────────────────────────────

const stepConfig: Record<
  string,
  {
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    color: string;
    bgColor: string;
    activeBg: string;
    lineColor: string;
  }
> = {
  problem_received: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    activeIcon: <MessageSquare className="h-3.5 w-3.5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/20",
    activeBg: "bg-blue-500/25 border-blue-500/40 shadow-blue-500/20",
    lineColor: "bg-blue-500/20",
  },
  ai_thinking: {
    icon: <Brain className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-violet-400",
    bgColor: "bg-violet-500/15 border-violet-500/20",
    activeBg: "bg-violet-500/25 border-violet-500/40 shadow-violet-500/20",
    lineColor: "bg-violet-500/20",
  },
  methodology_selection: {
    icon: <GitBranch className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/15 border-indigo-500/20",
    activeBg: "bg-indigo-500/25 border-indigo-500/40 shadow-indigo-500/20",
    lineColor: "bg-indigo-500/20",
  },
  root_cause_analysis: {
    icon: <Target className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/20",
    activeBg: "bg-amber-500/25 border-amber-500/40 shadow-amber-500/20",
    lineColor: "bg-amber-500/20",
  },
  action_proposal: {
    icon: <ListChecks className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/15 border-cyan-500/20",
    activeBg: "bg-cyan-500/25 border-cyan-500/40 shadow-cyan-500/20",
    lineColor: "bg-cyan-500/20",
  },
  similar_incidents: {
    icon: <Search className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/15 border-orange-500/20",
    activeBg: "bg-orange-500/25 border-orange-500/40 shadow-orange-500/20",
    lineColor: "bg-orange-500/20",
  },
  lessons_learned: {
    icon: <BookOpen className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/15 border-pink-500/20",
    activeBg: "bg-pink-500/25 border-pink-500/40 shadow-pink-500/20",
    lineColor: "bg-pink-500/20",
  },
  completion: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    activeIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/20",
    activeBg: "bg-emerald-500/25 border-emerald-500/40 shadow-emerald-500/20",
    lineColor: "bg-emerald-500/20",
  },
};

const pendingConfig = {
  icon: <Circle className="h-3 w-3" />,
  color: "text-muted-foreground/40",
  bgColor: "bg-muted/30 border-border/30",
  lineColor: "bg-border/20",
};

// ── Status Badge ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvestigationStepStatus }) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
          </span>
          İşleniyor
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Tamamlandı
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">
          Bekliyor
        </span>
      );
  }
}

// ── Duration Display ────────────────────────────────────────────────────

function formatDuration(ms?: number): string {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Main Component ──────────────────────────────────────────────────────

interface InvestigationTimelineProps {
  steps: InvestigationStep[];
  className?: string;
}

export function InvestigationTimeline({
  steps,
  className,
}: InvestigationTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest step
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [steps]);

  if (steps.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        const config = stepConfig[step.type] || stepConfig.problem_received;
        const isLast = index === steps.length - 1;
        const isPending = step.status === "pending";
        const isActive = step.status === "active";
        const isCompleted = step.status === "completed";

        return (
          <div
            key={step.id}
            className={cn(
              "group relative flex gap-4 pb-6 last:pb-0 transition-all duration-500",
              isPending && "opacity-40",
              isActive && "opacity-100",
              isCompleted && "opacity-100"
            )}
            style={{
              animation: isActive
                ? "fadeSlideIn 0.4s ease-out"
                : isCompleted
                  ? "none"
                  : undefined,
            }}
          >
            {/* Timeline connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[17px] top-9 h-[calc(100%-28px)] w-px transition-colors duration-500",
                  isPending ? pendingConfig.lineColor : config.lineColor,
                  isActive && "animate-pulse"
                )}
              />
            )}

            {/* Node */}
            <div
              className={cn(
                "relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                isPending
                  ? `${pendingConfig.bgColor} ${pendingConfig.color}`
                  : `${isActive ? config.activeBg : config.bgColor} ${config.color}`,
                isActive && "shadow-lg scale-110",
                isCompleted && "group-hover:scale-110 group-hover:shadow-lg"
              )}
            >
              {isPending
                ? pendingConfig.icon
                : isActive
                  ? config.activeIcon
                  : config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4
                  className={cn(
                    "text-sm font-semibold tracking-tight transition-colors duration-300",
                    isPending && "text-muted-foreground/40",
                    isActive && "text-foreground",
                    isCompleted && "text-foreground"
                  )}
                >
                  {step.title}
                </h4>
                <StatusBadge status={step.status} />
                {step.durationMs && isCompleted && (
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {formatDuration(step.durationMs)}
                  </span>
                )}
              </div>

              <p
                className={cn(
                  "text-[13px] leading-relaxed transition-colors duration-300",
                  isPending
                    ? "text-muted-foreground/30"
                    : "text-muted-foreground"
                )}
              >
                {step.description}
              </p>

              {/* Detail expansion for active/completed steps */}
              {step.detail && (isActive || isCompleted) && (
                <div
                  className={cn(
                    "mt-2 rounded-lg border p-3 text-xs leading-relaxed transition-all duration-500",
                    isActive
                      ? "border-violet-500/20 bg-violet-500/5 text-violet-300/80"
                      : "border-border/30 bg-muted/20 text-muted-foreground/70"
                  )}
                >
                  {step.detail}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
