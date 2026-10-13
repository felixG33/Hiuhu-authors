import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Compass, BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-parchment-200 dark:bg-ink-800 flex items-center justify-center mb-6 text-amber-700 dark:text-amber-400">
        <Compass className="h-8 w-8 animate-pulse" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-500 font-bold mb-2">
        Error 404 — Lost in the Stacks
      </span>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink-900 dark:text-parchment-100 max-w-lg mb-4">
        This Leaf Has Yet to Be Written
      </h1>

      <p className="font-serif text-base text-ink-600 dark:text-parchment-300 max-w-md mx-auto mb-8 leading-relaxed">
        The manuscript or literary archive you sought does not exist in our library, or has been cataloged under a different folio.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="gold" size="md" className="gap-2">
            <Home className="h-4 w-4" />
            Return to Sanctuary
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" size="md" className="gap-2">
            <Search className="h-4 w-4" />
            Search Library
          </Button>
        </Link>
        <Link href="/books">
          <Button variant="ghost" size="md" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Books
          </Button>
        </Link>
      </div>
    </div>
  );
}
