import React from "react";
import Link from "next/link";
import { Feather, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface PoemCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  publishedAt?: Date | string | null;
  author: {
    name: string;
    slug: string;
  };
}

export function PoemCard({ poem }: { poem: PoemCardData }) {
  // Extract first 4-6 lines of verses for poetry excerpt
  const verses = poem.excerpt || poem.content.split("\n").filter(Boolean).slice(0, 5).join("\n");

  return (
    <div className="group rounded-sm border border-parchment-300 dark:border-ink-800 bg-parchment-50/60 dark:bg-ink-900/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-700/40">
      <div>
        {/* Poetry Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-3">
          <Feather className="h-3.5 w-3.5" />
          <span>Poetic Verse</span>
        </div>

        {/* Title */}
        <Link href={`/poems/${poem.slug}`}>
          <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-parchment-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
            {poem.title}
          </h3>
        </Link>

        {/* Author Byline */}
        <p className="text-xs text-ink-600 dark:text-parchment-400 font-serif mt-1">
          by{" "}
          <Link
            href={`/authors/${poem.author.slug}`}
            className="text-ink-900 dark:text-parchment-200 underline decoration-dotted hover:text-amber-800"
          >
            {poem.author.name}
          </Link>
        </p>

        {/* Verses Preview (Preserving intentional line breaks) */}
        <div className="mt-5 p-4 rounded-xs border-l-2 border-amber-700/60 bg-white/70 dark:bg-ink-950/60 font-serif text-sm text-ink-800 dark:text-parchment-200 italic whitespace-pre-line leading-relaxed">
          {verses}
          {poem.content.split("\n").length > 5 && (
            <span className="block mt-2 text-ink-400 not-italic text-xs font-mono">
              […continues in full poem]
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-between text-xs font-mono text-ink-500">
        <span>{formatDate(poem.publishedAt)}</span>
        <Link
          href={`/poems/${poem.slug}`}
          className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Read Poem</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
