"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center text-xs text-ink-500 dark:text-parchment-400 mb-6 font-mono" aria-label="Breadcrumb">
      <Link href="/admin" className="hover:text-ink-900 dark:hover:text-parchment-100 flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join("/")}`;
        const isLast = index === segments.length - 2;
        const formatted = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 mx-2 text-ink-300 dark:text-ink-700" />
            {isLast ? (
              <span className="font-semibold text-ink-900 dark:text-parchment-100">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-ink-900 dark:hover:text-parchment-100">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
