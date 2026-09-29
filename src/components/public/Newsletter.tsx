"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section className="border-y border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-amber-800/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300">
          <Mail className="h-6 w-6" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-950 dark:text-parchment-50">
          The HIUHU Literary Dispatch
        </h2>

        <p className="font-serif text-base text-ink-600 dark:text-parchment-300 max-w-xl mx-auto leading-relaxed">
          Receive selected monthly anthologies, intimate author interviews, freshly published poems, and private invitations to literary readings.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 p-4 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-serif text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Thank you for subscribing. You have been entered into the reader registry.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4 rounded-sm border border-parchment-300 dark:border-ink-700 bg-parchment-50/50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 text-ink-900 dark:text-parchment-100"
            />
            <Button type="submit" variant="gold" size="lg" isLoading={loading} className="shrink-0 h-12 px-6">
              Subscribe
            </Button>
          </form>
        )}

        <p className="text-[11px] font-mono text-ink-400">
          Respecting your privacy. No marketing noise. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
