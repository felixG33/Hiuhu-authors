import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { AuthorCard } from "@/components/public/AuthorCard";
import { BookCard } from "@/components/public/BookCard";
import { ArticleCard } from "@/components/public/ArticleCard";
import { PoemCard } from "@/components/public/PoemCard";
import { StoryCard } from "@/components/public/StoryCard";
import { constructMetadata } from "@/lib/seo";
import { Search, BookOpen, Feather, Bookmark, FileText, User } from "lucide-react";
import { ContentStatus } from "@prisma/client";

export const metadata = constructMetadata({
  title: "Search Literature & Authors",
  description: "Search across published books, articles, poems, short stories, and author profiles at HIUHU.",
  canonicalUrl: "/search",
});

interface SearchPageProps {
  searchParams: { q?: string; type?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentUser();
  const query = searchParams.q?.trim() || "";
  const filterType = searchParams.type || "all";

  let authors: any[] = [];
  let books: any[] = [];
  let articles: any[] = [];
  let poems: any[] = [];
  let stories: any[] = [];

  if (query) {
    if (filterType === "all" || filterType === "authors") {
      authors = await db.authorProfile.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
            { genres: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          _count: { select: { contentItems: true, books: true } },
        },
      });
    }

    if (filterType === "all" || filterType === "books") {
      books = await db.book.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { author: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { author: { select: { name: true, slug: true } } },
      });
    }

    if (filterType === "all" || filterType === "articles") {
      articles = await db.contentItem.findMany({
        where: {
          type: "ARTICLE",
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: { select: { name: true, slug: true, photo: true } },
          category: { select: { name: true, slug: true, accentColor: true } },
        },
      });
    }

    if (filterType === "all" || filterType === "poems") {
      poems = await db.contentItem.findMany({
        where: {
          type: "POEM",
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { author: { select: { name: true, slug: true } } },
      });
    }

    if (filterType === "all" || filterType === "stories") {
      stories = await db.contentItem.findMany({
        where: {
          type: "STORY",
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { author: { select: { name: true, slug: true, photo: true } } },
      });
    }
  }

  const totalResults = authors.length + books.length + articles.length + poems.length + stories.length;

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
          {/* Search Header */}
          <div className="max-w-2xl space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold">Search Catalog</h1>
            <p className="font-serif text-base text-ink-600 dark:text-parchment-300">
              Find works across our collection of literature, poetry, essays, and authors.
            </p>

            <form method="GET" action="/search" className="relative pt-2">
              <Search className="absolute left-4 top-5.5 h-5 w-5 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search authors, books, poems, or essays..."
                className="w-full h-12 pl-12 pr-4 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </form>
          </div>

          {/* Filter Tabs */}
          {query && (
            <div className="flex flex-wrap gap-2 border-b border-parchment-200 dark:border-ink-800 pb-4 text-xs font-mono">
              {[
                { label: "All Works", value: "all" },
                { label: `Authors (${authors.length})`, value: "authors" },
                { label: `Books (${books.length})`, value: "books" },
                { label: `Articles (${articles.length})`, value: "articles" },
                { label: `Poems (${poems.length})`, value: "poems" },
                { label: `Stories (${stories.length})`, value: "stories" },
              ].map((tab) => (
                <a
                  key={tab.value}
                  href={`/search?q=${encodeURIComponent(query)}&type=${tab.value}`}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    filterType === tab.value
                      ? "bg-amber-900 text-white font-semibold"
                      : "bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-300 hover:bg-parchment-300"
                  }`}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          )}

          {/* Results Display */}
          {query && totalResults === 0 && (
            <div className="p-16 text-center border border-dashed border-parchment-300 dark:border-ink-800 rounded-sm">
              <p className="font-serif text-lg text-ink-600 dark:text-parchment-400">
                No literary works or authors found matching &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {/* Results Sections */}
          <div className="space-y-12">
            {authors.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-800" /> Authors ({authors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {authors.map((a) => (
                    <AuthorCard key={a.id} author={a} />
                  ))}
                </div>
              </section>
            )}

            {books.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-800" /> Books ({books.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {books.map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-800" /> Articles & Essays ({articles.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {articles.map((item) => (
                    <ArticleCard key={item.id} article={item} />
                  ))}
                </div>
              </section>
            )}

            {poems.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <Feather className="h-5 w-5 text-amber-800" /> Poetry ({poems.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {poems.map((poem) => (
                    <PoemCard key={poem.id} poem={poem} />
                  ))}
                </div>
              </section>
            )}

            {stories.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-800" /> Short Stories ({stories.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
