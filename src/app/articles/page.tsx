import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ArticleCard } from "@/components/public/ArticleCard";
import { constructMetadata } from "@/lib/seo";
import { Search } from "lucide-react";
import { ContentStatus } from "@prisma/client";

export const metadata = constructMetadata({
  title: "Articles & Essays",
  description: "Long-form literary essays, cultural criticism, and reflective dispatches from HIUHU authors.",
  canonicalUrl: "/articles",
});

interface ArticlesPageProps {
  searchParams: { q?: string; category?: string };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const user = await getCurrentUser();
  const query = searchParams.q || "";
  const categorySlug = searchParams.category || "";

  const where: any = {
    type: "ARTICLE",
    status: ContentStatus.PUBLISHED,
    deletedAt: null,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { author: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [articles, categories] = await Promise.all([
    db.contentItem.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true, slug: true, photo: true } },
        category: { select: { name: true, slug: true, accentColor: true } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
              Dispatches & Inquiry
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold">Articles & Essays</h1>
            <p className="font-serif text-base text-ink-600 dark:text-parchment-300 leading-relaxed">
              Long-form meditative non-fiction, literary theory, and philosophical essays from our contributors.
            </p>

            {/* Filter Search */}
            <form method="GET" action="/articles" className="relative max-w-md pt-2">
              <Search className="absolute left-3.5 top-5.5 h-4 w-4 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search essays by title or concept..."
                className="w-full h-11 pl-10 pr-4 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </form>
          </div>

          {/* Categories Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-b border-parchment-200 dark:border-ink-800 pb-4">
              <a
                href="/articles"
                className={`px-3 py-1 rounded-sm text-xs font-mono transition-colors ${
                  !categorySlug
                    ? "bg-amber-900 text-white"
                    : "bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-300 hover:bg-parchment-300"
                }`}
              >
                All Categories
              </a>
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/articles?category=${c.slug}`}
                  className={`px-3 py-1 rounded-sm text-xs font-mono transition-colors ${
                    categorySlug === c.slug
                      ? "bg-amber-900 text-white"
                      : "bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-300 hover:bg-parchment-300"
                  }`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          )}

          {/* Grid */}
          {articles.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-parchment-300 dark:border-ink-800 rounded-sm">
              <p className="font-serif text-lg text-ink-600 dark:text-parchment-400">
                No essays found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}