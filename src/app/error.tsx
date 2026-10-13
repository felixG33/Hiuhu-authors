"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CRITICAL SYSTEM ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-crimson-100 dark:bg-crimson-950/60 flex items-center justify-center mb-6 text-crimson-600 dark:text-crimson-400">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-crimson-600 font-bold mb-2">
        Manuscript Interruption
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-parchment-100 max-w-lg mb-4">
        An Unforeseen Anomaly Occurred
      </h1>

      <p className="font-serif text-sm text-ink-600 dark:text-parchment-300 max-w-md mx-auto mb-6 leading-relaxed">
        The application encountered an unexpected condition while rendering this literary section.
        Our editorial systems have logged the circumstance.
      </p>

      {error?.message && (
        <pre className="font-mono text-xs text-crimson-700 bg-crimson-50 dark:bg-crimson-950/40 p-3 rounded max-w-md mx-auto mb-6 overflow-x-auto text-left">
          {error.message}
        </pre>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="gold" size="md" onClick={() => reset()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Attempt Recovery
        </Button>
        <Link href="/">
          <Button variant="outline" size="md" className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
