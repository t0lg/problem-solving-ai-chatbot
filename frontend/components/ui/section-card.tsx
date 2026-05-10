"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
  glow?: boolean;
}

export function SectionCard({
  title,
  description,
  icon,
  children,
  className,
  headerAction,
  noPadding = false,
  glow = false,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
        "hover:border-border/80 hover:bg-card/70",
        glow &&
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:blur-xl",
        className
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0",
          noPadding ? "pb-2" : "pb-3"
        )}
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              {title}
            </CardTitle>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className={cn(noPadding && "px-0 pb-0")}>
        {children}
      </CardContent>
    </Card>
  );
}
