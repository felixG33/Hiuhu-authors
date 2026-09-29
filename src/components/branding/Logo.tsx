import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "admin";
  showTagline?: boolean;
  href?: string;
}

export function Logo({
  className,
  size = "md",
  variant = "default",
  showTagline = false,
  href = "/",
}: LogoProps) {
  const sizeClasses = {
    sm: "text-lg tracking-[0.2em]",
    md: "text-2xl tracking-[0.25em]",
    lg: "text-3xl tracking-[0.3em]",
    xl: "text-4xl md:text-5xl tracking-[0.35em]",
  };

  const svgSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
    xl: "w-12 h-12",
  };

  const textColor = {
    default: "text-ink-950 dark:text-parchment-50",
    light: "text-parchment-50",
    admin: "text-parchment-100",
  }[variant];

  const markColor = {
    default: "text-amber-800 dark:text-amber-400",
    light: "text-amber-300",
    admin: "text-amber-400",
  }[variant];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 font-serif select-none group", className)}>
      {/* Literary Monogram Quill & Open Book Emblem */}
      <svg
        className={cn(svgSizes[size], markColor, "transition-transform duration-300 group-hover:scale-105 shrink-0")}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 4L4 10V28C4 28 11 26 18 29C25 26 32 28 32 28V10L18 4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 4V29"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 14C13.5 15.5 16 16 18 16.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M25 14C22.5 15.5 20 16 18 16.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-serif font-semibold uppercase leading-none transition-colors",
            sizeClasses[size],
            textColor
          )}
        >
          HIUHU
        </span>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-medium text-ink-600 dark:text-parchment-400 mt-1">
            Authors & Literature
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-sm">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
