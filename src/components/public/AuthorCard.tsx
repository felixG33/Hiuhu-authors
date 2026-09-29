import React from "react";
import Link from "next/link";
import { MapPin, Globe, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface AuthorCardData {
  id: string;
  name: string;
  slug: string;
  photo?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  genres?: string | null;
  isFeatured?: boolean;
  _count?: {
    contentItems?: number;
    books?: number;
  };
}

export function AuthorCard({ author }: { author: AuthorCardData }) {
  const genresList = author.genres
    ? author.genres.split(",").map((g) => g.trim())
    : [];

  return (
    <div className="group relative rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-700/40">
      <div>
        <div className="flex items-start gap-4">
          {/* Author Portrait Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-parchment-300 dark:border-ink-700 bg-parchment-100 dark:bg-ink-800">
            {author.photo ? (
              <img
                src={author.photo}
                alt={author.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-xl font-semibold text-ink-700 dark:text-parchment-300">
                {author.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name & Location */}
          <div className="flex-1 min-w-0">
            {author.isFeatured && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-semibold mb-1 block">
                Featured Author
              </span>
            )}
            <Link href={`/authors/${author.slug}`}>
              <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-parchment-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors truncate">
                {author.name}
              </h3>
            </Link>
            {author.location && (
              <div className="flex items-center gap-1 text-xs text-ink-500 font-mono mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{author.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Biography Excerpt */}
        {author.bio && (
          <p className="font-serif text-xs text-ink-600 dark:text-parchment-300 line-clamp-3 leading-relaxed mt-4">
            {author.bio}
          </p>
        )}

        {/* Genres */}
        {genresList.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {genresList.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-between text-xs font-mono">
        <span className="text-ink-500">
          {(author._count?.contentItems || 0) + (author._count?.books || 0)} published works
        </span>
        <Link
          href={`/authors/${author.slug}`}
          className="text-amber-800 dark:text-amber-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
