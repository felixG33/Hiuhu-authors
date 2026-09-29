import React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  readingTimeMinutes?: number;
  category?: {
    name: string;
    slug: string;
    accentColor?: string | null;
  } | null;
  author: {
    name: string;
    slug: string;
    photo?: string | null;
  };
}

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-700/40">
      <div>
        {/* Cover image if available */}
        {article.coverImage && (
          <Link href={`/articles/${article.slug}`}>
            <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden mb-5 bg-parchment-200 dark:bg-ink-800 border border-parchment-200 dark:border-ink-800">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>
          </Link>
        )}

        {/* Category & Read Time */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-ink-500 mb-2">
          {article.category && (
            <Badge variant="secondary" className="text-[10px]">
              {article.category.name}
            </Badge>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTimeMinutes || 3} min read
          </span>
        </div>

        {/* Title */}
        <Link href={`/articles/${article.slug}`}>
          <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-parchment-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-snug">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-serif text-sm text-ink-600 dark:text-parchment-300 line-clamp-3 leading-relaxed mt-2.5">
            {article.excerpt}
          </p>
        )}
      </div>

      {/* Author & Date Footer */}
      <div className="mt-6 pt-4 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-between">
        <Link
          href={`/authors/${article.author.slug}`}
          className="flex items-center gap-2.5 text-xs text-ink-800 dark:text-parchment-200 hover:text-amber-800 transition-colors"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-parchment-300 dark:bg-ink-700 shrink-0">
            {article.author.photo ? (
              <img src={article.author.photo} alt={article.author.name} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center font-serif text-[10px] font-bold">
                {article.author.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-serif font-medium">{article.author.name}</span>
        </Link>

        <span className="text-[11px] font-mono text-ink-400">
          {formatDate(article.publishedAt)}
        </span>
      </div>
    </article>
  );
}
