"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimilarIncidentsCard } from "@/components/incidents/similar-incidents-card";
import { LessonsLearnedCard } from "@/components/lessons/lessons-learned-card";
import { MethodologyCard } from "@/components/methodology/methodology-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OptionalActionsPanel } from "@/components/actions/optional-actions-panel";
import { useProblemStore } from "@/store/useProblemStore";
import { Badge } from "@/components/ui/badge";
import {
  PanelRight,
  Lightbulb,
  Target,
  CheckCircle2,
  Brain,
} from "lucide-react";

export function InsightsPanel() {
  const {
    similarIncidents,
    lessonsLearned,
    selectedMethodology,
    availableMethodologies,
    analysisResult,
    isAnalyzing,
    isComplete,
    isInsightsPanelOpen,
    toggleInsightsPanel,
    analysisProgress,
    timelineSteps,
  } = useProblemStore();

  // Determine which sections should be visible based on completed steps
  const completedStepTypes = useMemo(
    () => new Set(timelineSteps.filter((s) => s.status === "completed").map((s) => s.type)),
    [timelineSteps]
  );

  const activeStepType = useMemo(
    () => timelineSteps.find((s) => s.status === "active")?.type || null,
    [timelineSteps]
  );

  const showMethodology = completedStepTypes.has("methodology_selection");
  const showRootCause = completedStepTypes.has("root_cause_analysis");
  const showSimilarIncidents = completedStepTypes.has("similar_incidents") && similarIncidents.length > 0;
  const showLessonsLearned = completedStepTypes.has("lessons_learned") && lessonsLearned.length > 0;

  const hasAnyData = showMethodology || showRootCause || showSimilarIncidents || showLessonsLearned;

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
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-500",
              isAnalyzing
                ? "bg-violet-500/15"
                : isComplete
                  ? "bg-emerald-500/10"
                  : "bg-amber-500/10"
            )}
          >
            {isAnalyzing ? (
              <Brain className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            ) : isComplete ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          <span className="text-sm font-semibold">
            {isAnalyzing ? "Analiz Ediliyor" : isComplete ? "Sonuçlar" : "İçgörüler"}
          </span>
          {isAnalyzing && (
            <Badge
              variant="outline"
              className="text-[9px] border-violet-500/30 text-violet-400 tabular-nums"
            >
              {analysisProgress}%
            </Badge>
          )}
        </div>
        <button
          onClick={toggleInsightsPanel}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PanelRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Active processing state */}
        {isAnalyzing && !hasAnyData && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-4">
                <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-violet-400 animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-full border border-violet-500/10 animate-ping opacity-20" />
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-1">
                YZ Motoru Aktif
              </p>
              <p className="text-xs text-muted-foreground/60">
                {activeStepType === "ai_thinking"
                  ? "Problem bağlamı analiz ediliyor..."
                  : activeStepType === "methodology_selection"
                    ? "Metodoloji seçiliyor..."
                    : "İşleniyor..."}
              </p>
            </div>
            <LoadingSkeleton variant="card" lines={3} />
            <LoadingSkeleton variant="card" lines={2} />
          </div>
        )}

        {/* Progressive reveal of insights */}
        {hasAnyData && (
          <div className="space-y-4">
            {/* Root Cause — appears after step 4 */}
            {showRootCause && analysisResult && (
              <div className="animate-fadeIn">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
                  Kök Neden
                </p>
                <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />
                    <p className="text-xs font-medium leading-relaxed text-foreground/90">
                      {analysisResult.rootCause}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${(analysisResult.confidenceScore || analysisResult.confidence) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 tabular-nums">
                      {Math.round((analysisResult.confidenceScore || analysisResult.confidence) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions — appear after step 5 (part of analysisResult) */}
            {showRootCause && analysisResult && analysisResult.correctiveActions && analysisResult.correctiveActions.length > 0 && (
              <div className="animate-fadeIn mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
                  Düzeltici Aksiyonlar
                </p>
                <div className="rounded-lg border border-border/30 bg-card/30 p-3 space-y-2">
                  {analysisResult.correctiveActions.slice(0, 4).map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 mt-0.5 text-cyan-400 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Actions */}
            {showRootCause && analysisResult && (
              <OptionalActionsPanel />
            )}

            {/* Selected Methodology — appears after step 3 */}
            {showMethodology && selectedMethodology && (
              <div className="animate-fadeIn">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
                  Seçilen Metodoloji
                </p>
                <MethodologyCard
                  methodology={selectedMethodology.methodology}
                  isSelected
                />
              </div>
            )}

            {/* Similar Incidents — appear after step 6 */}
            {showSimilarIncidents && (
              <div className="animate-fadeIn">
                <SimilarIncidentsCard incidents={similarIncidents} />
              </div>
            )}

            {/* Lessons Learned — appear after step 7 */}
            {showLessonsLearned && (
              <div className="animate-fadeIn">
                <LessonsLearnedCard lessons={lessonsLearned} />
              </div>
            )}

            {/* Loading placeholders for still-processing sections */}
            {isAnalyzing && (
              <div className="space-y-3 mt-2">
                {!showRootCause && (
                  <LoadingSkeleton variant="card" lines={3} />
                )}
                {!showSimilarIncidents && showRootCause && (
                  <LoadingSkeleton variant="card" lines={2} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state — nothing submitted yet */}
        {!isAnalyzing && !hasAnyData && !isComplete && (
          <div className="space-y-4">
            <EmptyState
              icon={<Lightbulb className="h-6 w-6" />}
              title="Henüz İçgörü Yok"
              description="Yapay zeka destekli içgörüler, benzer olaylar ve önerilen metodolojiler almak için bir problem gönderin."
            />

            {/* Suggested methodologies */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
                Mevcut Metodolojiler
              </p>
              {availableMethodologies.slice(0, 3).map((m) => (
                <MethodologyCard key={m.id} methodology={m} compact />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
