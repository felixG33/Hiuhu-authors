import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "gold";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-ink-950 text-parchment-50 dark:bg-parchment-100 dark:text-ink-950",
    secondary: "bg-parchment-200 text-ink-800 dark:bg-ink-800 dark:text-parchment-200",
    outline: "border border-ink-300 dark:border-ink-700 text-ink-700 dark:text-parchment-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    destructive: "bg-crimson-100 text-crimson-800 dark:bg-crimson-950/50 dark:text-crimson-300 border border-crimson-200 dark:border-crimson-800",
    gold: "bg-amber-800/10 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-700/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-medium tracking-wide transition-colors uppercase select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
