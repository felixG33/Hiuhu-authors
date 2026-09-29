import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-3 py-2 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-700 focus-visible:border-amber-700 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 dark:text-parchment-100 transition-colors",
            error && "border-crimson-600 focus-visible:ring-crimson-600 focus-visible:border-crimson-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-crimson-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
