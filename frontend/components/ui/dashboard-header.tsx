"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  children,
  className,
  badge,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-1 border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md",
        "sticky top-0 z-30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
