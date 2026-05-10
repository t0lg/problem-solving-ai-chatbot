"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimilarIncidentsCard } from "@/components/incidents/similar-incidents-card";
import { LessonsLearnedCard } from "@/components/lessons/lessons-learned-card";
import { MethodologyCard } from "@/components/methodology/methodology-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useProblemStore } from "@/store/useProblemStore";
import { PanelRight, Lightbulb } from "lucide-react";

export function InsightsPanel() {
  const {
    similarIncidents,
    lessonsLearned,
    selectedMethodology,
    availableMethodologies,
    isAnalyzing,
    isInsightsPanelOpen,
    toggleInsightsPanel,
  } = useProblemStore();

  const hasData =
    similarIncidents.length > 0 ||
    lessonsLearned.length > 0 ||
    selectedMethodology !== null;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-border/50 bg-background/50 transition-all duration-300",
        isInsightsPanelOpen ? "w-[340px]" : "w-0 overflow-hidden border-l-0"
      )}
    >
      {/* Panel Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold">Insights</span>
        </div>
        <button
          onClick={toggleInsightsPanel}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PanelRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isAnalyzing ? (
          <div className="space-y-4">
            <LoadingSkeleton variant="card" lines={3} />
            <LoadingSkeleton variant="card" lines={2} />
            <LoadingSkeleton variant="card" lines={4} />
          </div>
        ) : hasData ? (
          <div className="space-y-4">
            {/* Similar Incidents */}
            {similarIncidents.length > 0 && (
              <SimilarIncidentsCard incidents={similarIncidents} />
            )}

            {/* Lessons Learned */}
            {lessonsLearned.length > 0 && (
              <LessonsLearnedCard lessons={lessonsLearned} />
            )}

            {/* Selected Methodology */}
            {selectedMethodology && (
              <MethodologyCard
                methodology={selectedMethodology.methodology}
                isSelected
              />
            )}

            {/* Suggested Methodologies */}
            {!selectedMethodology && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
                  Suggested Methodologies
                </p>
                {availableMethodologies.slice(0, 3).map((m) => (
                  <MethodologyCard key={m.id} methodology={m} compact />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Lightbulb className="h-6 w-6" />}
            title="No Insights Yet"
            description="Submit a problem to receive AI-powered insights, similar incidents, and recommended methodologies."
          />
        )}
      </ScrollArea>
    </aside>
  );
}
