import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export interface BookCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publicationDate?: Date | string | null;
  genre?: string | null;
  pages?: number | null;
  buyUrl?: string | null;
  author: {
    name: string;
    slug: string;
  };
}

export function BookCard({ book }: { book: BookCardData }) {
  return (
    <div className="group rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-700/40">
      <div>
        {/* Book Cover Container with Literary Aspect Ratio */}
        <Link href={`/books/${book.slug}`}>
          <div className="relative aspect-[2/3] w-full rounded-xs overflow-hidden mb-4 bg-parchment-200 dark:bg-ink-800 border border-parchment-300 dark:border-ink-700 shadow-sm group-hover:shadow-md transition-shadow">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-parchment-100 to-parchment-300 dark:from-ink-900 dark:to-ink-800">
                <BookOpen className="h-10 w-10 text-amber-800/40 dark:text-amber-400/40 mb-3" />
                <h4 className="font-serif text-sm font-bold text-ink-900 dark:text-parchment-100 line-clamp-3">
                  {book.title}
                </h4>
                <p className="font-serif text-xs text-ink-600 dark:text-parchment-400 mt-2">
                  {book.author.name}
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Metadata */}
        <div className="space-y-1.5">
          {book.genre && (
            <Badge variant="gold" className="text-[10px]">
              {book.genre}
            </Badge>
          )}

          <Link href={`/books/${book.slug}`}>
            <h3 className="font-serif text-base font-semibold text-ink-950 dark:text-parchment-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
              {book.title}
            </h3>
          </Link>

          <p className="text-xs text-ink-600 dark:text-parchment-300 font-serif">
            by{" "}
            <Link
              href={`/authors/${book.author.slug}`}
              className="text-ink-900 dark:text-parchment-100 underline decoration-dotted hover:text-amber-800"
            >
              {book.author.name}
            </Link>
          </p>

          <p className="text-xs text-ink-500 dark:text-parchment-400 font-serif line-clamp-2 leading-relaxed pt-1">
            {book.description}
          </p>
        </div>
      </div>

      {/* Footer Info & Buy Link */}
      <div className="mt-4 pt-3 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-between text-[11px] font-mono text-ink-500">
        <span>{book.pages ? `${book.pages} pages` : "Hardcover / eBook"}</span>
        {book.buyUrl ? (
          <a
            href={book.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Acquire</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <Link href={`/books/${book.slug}`} className="text-amber-800 dark:text-amber-400 font-semibold hover:underline">
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
