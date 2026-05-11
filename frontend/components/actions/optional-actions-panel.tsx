"use client";

import { useProblemStore } from "@/store/useProblemStore";
import { Button } from "@/components/ui/button";
import { CheckSquare, Mail, Package, AlertTriangle, Wrench, PlayCircle } from "lucide-react";

export function OptionalActionsPanel() {
  const { optionalActions } = useProblemStore();

  if (!optionalActions || optionalActions.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "assign_task":
        return <CheckSquare className="h-4 w-4 text-blue-400" />;
      case "draft_email":
        return <Mail className="h-4 w-4 text-violet-400" />;
      case "check_inventory":
        return <Package className="h-4 w-4 text-emerald-400" />;
      case "escalate_incident":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "schedule_maintenance":
        return <Wrench className="h-4 w-4 text-cyan-400" />;
      default:
        return <PlayCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3 mt-4 animate-fadeIn">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
        Operasyonel Aksiyonlar
      </p>
      <div className="grid gap-2">
        {optionalActions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="mt-0.5">
                {getIcon(action.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="shrink-0 ml-4 h-7 text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/30">
              Başlat
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
