import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[120px] w-full rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-3 py-2 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-700 focus-visible:border-amber-700 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 dark:text-parchment-100 transition-colors leading-relaxed",
            error && "border-crimson-600 focus-visible:ring-crimson-600 focus-visible:border-crimson-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-ink-500">{helperText}</p>}
        {error && <p className="text-xs text-crimson-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
