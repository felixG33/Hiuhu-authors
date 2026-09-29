import React from "react";
import Link from "next/link";
import { Bookmark, Clock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface StoryCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  readingTimeMinutes?: number;
  author: {
    name: string;
    slug: string;
    photo?: string | null;
  };
}

export function StoryCard({ story }: { story: StoryCardData }) {
  return (
    <div className="group rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-700/40">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-2">
          <Bookmark className="h-3.5 w-3.5" />
          <span>Short Fiction</span>
        </div>

        <Link href={`/stories/${story.slug}`}>
          <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-parchment-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-snug">
            {story.title}
          </h3>
        </Link>

        <p className="text-xs text-ink-600 dark:text-parchment-400 font-serif mt-1">
          by{" "}
          <Link
            href={`/authors/${story.author.slug}`}
            className="text-ink-900 dark:text-parchment-200 underline decoration-dotted hover:text-amber-800"
          >
            {story.author.name}
          </Link>
        </p>

        {story.excerpt && (
          <p className="font-serif text-sm text-ink-600 dark:text-parchment-300 line-clamp-3 leading-relaxed mt-3">
            {story.excerpt}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-between text-xs font-mono text-ink-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {story.readingTimeMinutes || 5} min read
        </span>
        <Link
          href={`/stories/${story.slug}`}
          className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Read Story</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
