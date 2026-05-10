"use client";

import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import type { LessonLearned } from "@/types/incident";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface LessonsLearnedCardProps {
  lessons: LessonLearned[];
  className?: string;
}

export function LessonsLearnedCard({
  lessons,
  className,
}: LessonsLearnedCardProps) {
  return (
    <SectionCard
      title="Çıkarılan Dersler"
      description="Geçmiş benzer olaylardan"
      icon={<BookOpen className="h-4 w-4" />}
      className={cn(className)}
    >
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="rounded-lg border border-border/40 p-3 space-y-2.5 transition-colors hover:border-border/60"
          >
            <p className="text-sm font-medium leading-tight">{lesson.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {lesson.description}
            </p>

            {/* Actions taken */}
            <div className="space-y-1">
              {lesson.actionsTaken.slice(0, 2).map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  <span className="line-clamp-1">{action}</span>
                </div>
              ))}
              {lesson.actionsTaken.length > 2 && (
                <p className="pl-5 text-[10px] text-muted-foreground/60">
                  +{lesson.actionsTaken.length - 2} aksiyon daha
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {lesson.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="h-4 rounded-sm px-1 text-[9px] font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
