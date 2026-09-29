import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none text-sm tracking-wide";

    const variants = {
      default:
        "bg-ink-950 text-parchment-50 hover:bg-ink-800 dark:bg-parchment-100 dark:text-ink-950 dark:hover:bg-parchment-200 focus-visible:ring-ink-950",
      secondary:
        "bg-parchment-200 text-ink-900 hover:bg-parchment-300 dark:bg-ink-800 dark:text-parchment-100 dark:hover:bg-ink-700 focus-visible:ring-ink-500",
      outline:
        "border border-ink-300 dark:border-ink-700 bg-transparent hover:bg-parchment-100 dark:hover:bg-ink-900 text-ink-900 dark:text-parchment-100 focus-visible:ring-ink-500",
      ghost:
        "bg-transparent hover:bg-parchment-200/60 dark:hover:bg-ink-800/60 text-ink-900 dark:text-parchment-100 focus-visible:ring-ink-500",
      destructive:
        "bg-crimson-600 text-white hover:bg-crimson-700 focus-visible:ring-crimson-600",
      gold:
        "bg-amber-800 text-white hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 focus-visible:ring-amber-700",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-sm",
      md: "h-10 px-4 py-2 rounded-sm",
      lg: "h-12 px-6 text-base rounded-sm",
      icon: "h-10 w-10 p-0 rounded-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
