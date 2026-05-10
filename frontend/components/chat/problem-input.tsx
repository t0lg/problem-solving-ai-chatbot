"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProblemStore } from "@/store/useProblemStore";
import { Send, Sparkles } from "lucide-react";

interface ProblemInputProps {
  className?: string;
}

export function ProblemInput({ className }: ProblemInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { submitProblem, startAnalysis, isAnalyzing } = useProblemStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    submitProblem(title.trim(), description.trim());
    startAnalysis();
    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm transition-all focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-foreground/80">
            Describe Your Problem
          </span>
        </div>

        <Input
          placeholder="Problem title (e.g. Conveyor Belt Motor Overheating)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2 border-none bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
        />

        <textarea
          placeholder="Provide detailed context about the problem, including when it started, affected systems, and any observations..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
            <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
              ⌘
            </kbd>
            <kbd className="rounded border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>
            <span>to submit</span>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || !description.trim() || isAnalyzing}
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
