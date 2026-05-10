"use client";

import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/problem";
import {
  MessageSquare,
  Cpu,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; lineColor: string }
> = {
  input: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/20",
    lineColor: "bg-blue-500/20",
  },
  analysis: {
    icon: <Cpu className="h-3.5 w-3.5" />,
    color: "text-violet-400",
    bgColor: "bg-violet-500/15 border-violet-500/20",
    lineColor: "bg-violet-500/20",
  },
  insight: {
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/20",
    lineColor: "bg-amber-500/20",
  },
  recommendation: {
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/15 border-indigo-500/20",
    lineColor: "bg-indigo-500/20",
  },
  resolution: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/20",
    lineColor: "bg-emerald-500/20",
  },
};

interface InvestigationTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InvestigationTimeline({
  events,
  className,
}: InvestigationTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {events.map((event, index) => {
        const config = typeConfig[event.type] || typeConfig.input;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="group relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[17px] top-9 h-[calc(100%-28px)] w-px",
                  config.lineColor
                )}
              />
            )}

            {/* Node */}
            <div
              className={cn(
                "relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border",
                config.bgColor,
                config.color,
                "transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
              )}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold tracking-tight">
                  {event.title}
                </h4>
                <span className="text-[10px] text-muted-foreground/60 font-mono">
                  {formatTime(event.timestamp)}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
