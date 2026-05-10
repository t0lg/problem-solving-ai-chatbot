"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { ProblemInput } from "@/components/chat/problem-input";
import { InvestigationTimeline } from "@/components/timeline/investigation-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProblemStore } from "@/store/useProblemStore";
import {
  Search,
  Sparkles,
  RotateCcw,
  Target,
  CheckCircle2,
} from "lucide-react";

export default function InvestigationPage() {
  const {
    currentProblem,
    analysisResult,
    isAnalyzing,
    resetAnalysis,
  } = useProblemStore();

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Investigation"
        description="AI-powered root cause analysis"
        badge={
          currentProblem && (
            <Badge
              variant="outline"
              className="gap-1 border-violet-500/30 text-violet-400 text-[10px]"
            >
              <Sparkles className="h-3 w-3" />
              Active
            </Badge>
          )
        }
      >
        {currentProblem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAnalysis}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Investigation
          </Button>
        )}
      </DashboardHeader>

      <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Problem Input */}
        <ProblemInput />

        {/* Current Problem Info */}
        {currentProblem && (
          <SectionCard
            title={currentProblem.title}
            description={`${currentProblem.id} · ${currentProblem.category}`}
            icon={<Target className="h-4 w-4" />}
            headerAction={
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${
                  currentProblem.severity === "critical"
                    ? "border-red-500/30 text-red-400"
                    : currentProblem.severity === "high"
                      ? "border-orange-500/30 text-orange-400"
                      : "border-amber-500/30 text-amber-400"
                }`}
              >
                {currentProblem.severity}
              </Badge>
            }
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentProblem.description}
            </p>
          </SectionCard>
        )}

        {/* Analysis Timeline */}
        {isAnalyzing && (
          <SectionCard
            title="Analyzing..."
            description="AI is processing your problem"
            icon={
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
            }
          >
            <LoadingSkeleton variant="timeline" lines={4} />
          </SectionCard>
        )}

        {analysisResult && !isAnalyzing && (
          <>
            {/* Timeline */}
            <SectionCard
              title="Investigation Timeline"
              description="Step-by-step AI analysis"
              icon={<Sparkles className="h-4 w-4" />}
              glow
            >
              <InvestigationTimeline events={analysisResult.timeline} />
            </SectionCard>

            {/* Root Cause */}
            <SectionCard
              title="Root Cause Identified"
              description={`Confidence: ${Math.round(analysisResult.confidence * 100)}%`}
              icon={<Target className="h-4 w-4" />}
              headerAction={
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{
                        width: `${analysisResult.confidence * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
              }
              glow
            >
              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 p-4">
                  <p className="text-sm font-medium leading-relaxed">
                    {analysisResult.rootCause}
                  </p>
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Recommended Actions
                  </p>
                  <div className="space-y-2">
                    {analysisResult.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* Empty State */}
        {!currentProblem && !isAnalyzing && (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="Start an Investigation"
            description="Describe your industrial problem above and let AI analyze root causes, find similar incidents, and recommend solutions."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
