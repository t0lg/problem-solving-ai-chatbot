"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProblemStore } from "@/store/useProblemStore";
import { Send, Sparkles, Brain, RotateCcw } from "lucide-react";

interface ProblemInputProps {
  className?: string;
}

export function ProblemInput({ className }: ProblemInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const {
    submitProblem,
    startAnalysis,
    isAnalyzing,
    isComplete,
    analysisState,
    nextQuestion,
    analysisProgress,
    resetInvestigation,
    currentProblem,
  } = useProblemStore();

  const isWaitingUser = analysisState === "WAITING_USER";
  const disabled = (isAnalyzing && !isWaitingUser) || (isComplete && !isWaitingUser);
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !disabled;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      
      if (isWaitingUser) {
        // Just mock continuing the analysis
        useProblemStore.setState({ analysisState: "ANALYZING", isAnalyzing: true });
        setTitle("");
        setDescription("");
      } else {
        submitProblem(title.trim(), description.trim());
        startAnalysis();
        setTitle("");
        setDescription("");
      }
    },
    [canSubmit, title, description, submitProblem, startAnalysis, isWaitingUser]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative rounded-xl border bg-card/40 backdrop-blur-sm transition-all duration-300",
            isAnalyzing && !isWaitingUser
              ? "border-violet-500/30 ring-1 ring-violet-500/10"
              : isWaitingUser 
                ? "border-amber-500/30 ring-1 ring-amber-500/10" 
                : "border-border/50 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10",
            isComplete && !isWaitingUser && "border-emerald-500/30 ring-1 ring-emerald-500/10"
          )}
        >
          {/* Progress bar — runs along the top edge */}
          {isAnalyzing && !isWaitingUser && (
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-xl">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Complete indicator */}
          {isComplete && !isWaitingUser && (
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl bg-gradient-to-r from-emerald-500 to-emerald-400" />
          )}

          {/* Waiting User indicator */}
          {isWaitingUser && (
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-xl bg-amber-500/20">
               <div className="h-full bg-amber-500 w-1/3 animate-shimmer" />
            </div>
          )}

          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-300",
                    isAnalyzing && !isWaitingUser
                      ? "bg-gradient-to-br from-violet-500/30 to-indigo-500/30"
                      : isWaitingUser
                        ? "bg-gradient-to-br from-amber-500/30 to-amber-600/30"
                        : isComplete
                          ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                          : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20"
                  )}
                >
                  {isAnalyzing && !isWaitingUser ? (
                    <Brain className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                  ) : isWaitingUser ? (
                    <Brain className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground/80">
                  {isAnalyzing && !isWaitingUser
                    ? "YZ Analiz Ediyor..."
                    : isWaitingUser
                      ? "Cevabınız Bekleniyor"
                      : isComplete
                        ? "Analiz Tamamlandı"
                        : "Probleminizi Açıklayın"}
                </span>
              </div>

              {/* Progress percentage during analysis */}
              {isAnalyzing && !isWaitingUser && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-violet-400 tabular-nums w-8 text-right">
                    {analysisProgress}%
                  </span>
                </div>
              )}

              {/* Reset button when complete */}
              {isComplete && !isAnalyzing && !isWaitingUser && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetInvestigation}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7"
                >
                  <RotateCcw className="h-3 w-3" />
                  Yeni
                </Button>
              )}
            </div>

            {/* Inputs */}
            {!isWaitingUser && (
            <Input
              placeholder="Problem başlığı (örn. Taşıyıcı Bant Motorunun Aşırı Isınması)"
              value={isAnalyzing || isComplete ? currentProblem?.title || "" : title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={cn(
                "mb-2 border-none bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            />
            )}

            <textarea
              placeholder={isWaitingUser && nextQuestion ? nextQuestion : "Ne zaman başladığı, etkilenen sistemler ve gözlemler dahil olmak üzere problem hakkında ayrıntılı bağlam sağlayın..."}
              value={disabled && !isWaitingUser ? currentProblem?.description || "" : description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (isWaitingUser) setTitle("Yanıt");
              }}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={disabled}
              className={cn(
                "w-full resize-none bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none leading-relaxed",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            />

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                {isAnalyzing && !isWaitingUser ? (
                  <span className="flex items-center gap-1.5 text-violet-400/70">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    YZ motoru probleminizi işliyor...
                  </span>
                ) : isWaitingUser ? (
                  <span className="flex items-center gap-1.5 text-amber-400/70">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Soruya yanıt verin
                  </span>
                ) : isComplete ? (
                  <span className="flex items-center gap-1.5 text-emerald-400/70">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    İnceleme sonuçları aşağıda hazır
                  </span>
                ) : (
                  <>
                    <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                      ⌘
                    </kbd>
                    <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                      Enter
                    </kbd>
                    <span>göndermek için</span>
                  </>
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={!canSubmit}
                className={cn(
                  "gap-1.5 transition-all",
                  isAnalyzing && !isWaitingUser
                    ? "bg-violet-600/50 text-white/70 cursor-not-allowed"
                    : isWaitingUser
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : isComplete
                        ? "bg-emerald-600/50 text-white/70 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                )}
              >
                {isAnalyzing && !isWaitingUser ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analiz Ediliyor...
                  </>
                ) : isWaitingUser ? (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Yanıtla
                  </>
                ) : isComplete ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Tamamlandı
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Analiz Et
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
