import React from "react";
import Link from "next/link";
import { Search, Feather, BookOpen, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  title?: string;
  tagline?: string;
  description?: string;
}

export function Hero({
  title = "HIUHU",
  tagline = "Where Voices Echo Through Time",
  description = "The official literary sanctuary and personal folio of author and poet HIUHU. Explore published books, structural poetics, transformative fiction, and contemplative essays.",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 border-b border-parchment-300/80 dark:border-ink-800 shadow-xs">
      {/* Scenic Background layer highlighting the author's desk and sunset landscape */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-parchment-50/70 via-parchment-50/60 to-parchment-50/90 dark:from-ink-950/80 dark:via-ink-950/70 dark:to-ink-950/95 backdrop-blur-[0.5px]" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10">
        {/* Author Folio Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-900/30 dark:border-amber-400/30 bg-white/70 dark:bg-ink-900/70 backdrop-blur-md text-amber-950 dark:text-amber-300 text-xs font-mono tracking-widest uppercase mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Feather className="h-3.5 w-3.5 text-amber-800 dark:text-amber-400" />
          <span>Author, Poet & Essayist • Official Folio</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ink-950 dark:text-parchment-50 leading-[1.05] mb-4 drop-shadow-xs">
          {title}
        </h1>

        <p className="font-serif text-xl sm:text-2xl text-amber-950 dark:text-amber-400 font-medium italic mb-6">
          &ldquo;{tagline}&rdquo;
        </p>

        {/* Hero Description */}
        <p className="font-serif text-base sm:text-lg text-ink-800 dark:text-parchment-200 max-w-2xl mx-auto leading-relaxed mb-8 bg-white/40 dark:bg-ink-900/40 backdrop-blur-xs p-3 rounded-sm">
          {description}
        </p>

        {/* Clean Search Form */}
        <form
          action="/search"
          method="GET"
          className="max-w-lg mx-auto relative flex items-center mb-8 shadow-sm"
        >
          <Search className="absolute left-4 h-4 w-4 text-ink-500 pointer-events-none" />
          <input
            type="search"
            name="q"
            placeholder="Search books, poems, essays, or stories..."
            className="w-full h-11 pl-11 pr-28 rounded-sm border border-parchment-300/80 dark:border-ink-700 bg-white/90 dark:bg-ink-900/90 backdrop-blur-md text-xs font-sans placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-amber-700 text-ink-900 dark:text-parchment-100"
          />
          <div className="absolute right-1">
            <Button type="submit" variant="gold" size="sm" className="h-9 px-4 text-xs">
              Search
            </Button>
          </div>
        </form>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono uppercase tracking-wider">
          <Link href="/books">
            <Button variant="default" size="md" className="gap-2 shadow-xs">
              <BookOpen className="h-4 w-4" />
              Books & Catalog
            </Button>
          </Link>
          <Link href="/poems">
            <Button variant="outline" size="md" className="gap-2 bg-white/70 dark:bg-ink-900/70 backdrop-blur-md shadow-xs">
              <Feather className="h-4 w-4" />
              Poetry & Verse
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="md" className="gap-2 text-amber-950 dark:text-amber-300 bg-white/40 dark:bg-ink-900/40 backdrop-blur-xs hover:bg-amber-100/60 dark:hover:bg-amber-950/60">
              <User className="h-4 w-4" />
              About the Author
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
