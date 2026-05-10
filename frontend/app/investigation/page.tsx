"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { ProblemInput } from "@/components/chat/problem-input";
import { InvestigationTimeline } from "@/components/timeline/investigation-timeline";
import { EmptyState } from "@/components/ui/empty-state";
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
  Brain,
  Clock,
} from "lucide-react";

export default function InvestigationPage() {
  const {
    currentProblem,
    analysisResult,
    isAnalyzing,
    isComplete,
    timelineSteps,
    analysisProgress,
    resetInvestigation,
  } = useProblemStore();

  const hasTimeline = timelineSteps.length > 0;
  const completedSteps = timelineSteps.filter((s) => s.status === "completed").length;
  const totalSteps = timelineSteps.length;

  return (
    <DashboardLayout>
      <DashboardHeader
        title="İnceleme"
        description="Yapay zeka destekli kök neden analizi"
        badge={
          isAnalyzing ? (
            <Badge
              variant="outline"
              className="gap-1 border-violet-500/30 text-violet-400 text-[10px]"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Analiz Ediliyor · {analysisProgress}%
            </Badge>
          ) : isComplete ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 text-emerald-400 text-[10px]"
            >
              <CheckCircle2 className="h-3 w-3" />
              Tamamlandı
            </Badge>
          ) : currentProblem ? (
            <Badge
              variant="outline"
              className="gap-1 border-violet-500/30 text-violet-400 text-[10px]"
            >
              <Sparkles className="h-3 w-3" />
              Aktif
            </Badge>
          ) : null
        }
      >
        {(currentProblem || isComplete) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetInvestigation}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Yeni İnceleme
          </Button>
        )}
      </DashboardHeader>

      <div className="p-6 space-y-6 max-w-4xl mx-auto w-full overflow-y-auto flex-1">
        {/* Problem Input */}
        <ProblemInput />

        {/* Current Problem Card */}
        {currentProblem && (
          <SectionCard
            title={currentProblem.title}
            description={`${currentProblem.id} · ${currentProblem.category}`}
            icon={<Target className="h-4 w-4" />}
            headerAction={
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${
                    currentProblem.severity === "critical"
                      ? "border-red-500/30 text-red-400"
                      : currentProblem.severity === "high"
                        ? "border-orange-500/30 text-orange-400"
                        : currentProblem.severity === "medium"
                          ? "border-amber-500/30 text-amber-400"
                          : "border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {currentProblem.severity}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${
                    currentProblem.status === "analyzing"
                      ? "border-violet-500/30 text-violet-400"
                      : currentProblem.status === "in_progress"
                        ? "border-blue-500/30 text-blue-400"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentProblem.status.replace("_", " ")}
                </Badge>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentProblem.description}
            </p>
            {currentProblem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {currentProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* AI Investigation Timeline */}
        {hasTimeline && (
          <SectionCard
            title="YZ İnceleme Zaman Çizelgesi"
            description={
              isAnalyzing
                ? "YZ akıl yürütme devam ediyor..."
                : isComplete
                  ? `${completedSteps}/${totalSteps} adım tamamlandı`
                  : "Adım adım analiz"
            }
            icon={
              isAnalyzing ? (
                <Brain className="h-4 w-4 text-violet-400 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )
            }
            headerAction={
              isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-violet-400 tabular-nums">
                    {analysisProgress}%
                  </span>
                </div>
              ) : isComplete ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400">
                    Tamamlandı
                  </span>
                </div>
              ) : null
            }
            glow={isComplete}
          >
            <InvestigationTimeline steps={timelineSteps} />
          </SectionCard>
        )}

        {/* Root Cause + Recommendations — visible when analysis complete */}
        {isComplete && analysisResult && (
          <SectionCard
            title="Kök Neden Tespit Edildi"
            description={`Güvenilirlik: ${Math.round(analysisResult.confidence * 100)}%`}
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

              {/* Findings */}
              {analysisResult.findings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Anahtar Bulgular
                  </p>
                  <div className="space-y-2">
                    {analysisResult.findings.map((finding) => (
                      <div
                        key={finding.id}
                        className="rounded-lg border border-border/30 bg-card/30 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {finding.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] capitalize ${
                              finding.severity === "critical" || finding.severity === "high"
                                ? "border-orange-500/30 text-orange-400"
                                : "border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          {finding.description}
                        </p>
                        {finding.evidence.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {finding.evidence.map((ev, i) => (
                              <span
                                key={i}
                                className="text-[9px] rounded bg-muted/50 px-1.5 py-0.5 text-muted-foreground/60"
                              >
                                📎 {ev}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground">
                  Önerilen Aksiyonlar
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

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 pt-2 border-t border-border/20">
                <Clock className="h-3 w-3" />
                Analiz tamamlandı:{" "}
                {new Date(analysisResult.createdAt).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Empty State */}
        {!currentProblem && !isAnalyzing && !isComplete && (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="Bir İnceleme Başlatın"
            description="Endüstriyel probleminizi yukarıda açıklayın ve yapay zekanın kök nedenleri analiz etmesine, benzer olayları bulmasına ve çözümler önermesine izin verin."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
