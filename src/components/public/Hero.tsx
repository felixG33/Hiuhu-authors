import React from "react";
import Link from "next/link";
import { Search, Feather, BookOpen, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  title?: string;
  description?: string;
  featuredAuthorName?: string;
}

export function Hero({
  title = "Where Voices Echo Through Time",
  description = "HIUHU is an independent literary sanctuary celebrating visionary authors, evocative poetry, transformative fiction, and profound essays.",
  featuredAuthorName,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 border-b border-parchment-300 dark:border-ink-800 bg-gradient-to-b from-parchment-100/80 via-parchment-50 to-parchment-100/40 dark:from-ink-950 dark:via-ink-900/60 dark:to-ink-950">
      {/* Subtle decorative background watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none font-serif text-[28vw] leading-none text-ink-950 dark:text-parchment-50">
        HIUHU
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center relative z-10">
        {/* Literary Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-800/30 dark:border-amber-400/30 bg-amber-800/5 dark:bg-amber-400/5 text-amber-900 dark:text-amber-300 text-xs font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Feather className="h-3.5 w-3.5" />
          <span>Independent Publishing & Authors Press</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink-950 dark:text-parchment-50 leading-[1.1] mb-6">
          {title}
        </h1>

        {/* Hero Description */}
        <p className="font-serif text-lg sm:text-xl text-ink-600 dark:text-parchment-300 max-w-2xl mx-auto leading-relaxed mb-10">
          {description}
        </p>

        {/* Search Bar Form */}
        <form
          action="/search"
          method="GET"
          className="max-w-xl mx-auto relative flex items-center mb-10 shadow-sm"
        >
          <Search className="absolute left-4 h-5 w-5 text-ink-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            placeholder="Search authors, books, poems, or essays..."
            className="w-full h-13 pl-12 pr-32 rounded-sm border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm font-sans placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-700 text-ink-900 dark:text-parchment-100"
          />
          <div className="absolute right-1.5">
            <Button type="submit" variant="gold" size="sm" className="h-10 px-4">
              Explore
            </Button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider">
          <Link href="/authors">
            <Button variant="default" size="lg" className="gap-2">
              <Compass className="h-4 w-4" />
              Discover Authors
            </Button>
          </Link>
          <Link href="/books">
            <Button variant="outline" size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Books
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="ghost" size="lg" className="gap-2 text-amber-800 dark:text-amber-400">
              Submit Your Work
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
