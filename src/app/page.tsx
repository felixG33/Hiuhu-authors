import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Hero } from "@/components/public/Hero";
import { BookCard } from "@/components/public/BookCard";
import { ArticleCard } from "@/components/public/ArticleCard";
import { PoemCard } from "@/components/public/PoemCard";
import { StoryCard } from "@/components/public/StoryCard";
import { Newsletter } from "@/components/public/Newsletter";
import { JsonLd } from "@/components/public/JsonLd";
import { generateWebSiteSchema } from "@/lib/seo";
import { ArrowRight, Feather, BookOpen, User, Sparkles, MapPin, Globe } from "lucide-react";
import { ContentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const user = await getCurrentUser();

  // Fetch Author Profile & Works
  let authorProfile: any = null;
  let featuredBooks: any[] = [];
  let latestArticles: any[] = [];
  let latestPoems: any[] = [];
  let latestStories: any[] = [];
  let categories: any[] = [];

  try {
    const results = await Promise.all([
      db.authorProfile.findFirst({
        orderBy: { isFeatured: "desc" },
        include: {
          _count: {
            select: {
              contentItems: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } },
              books: { where: { deletedAt: null } },
            },
          },
        },
      }),
      db.book.findMany({
        where: { deletedAt: null },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true, slug: true } },
        },
      }),
      db.contentItem.findMany({
        where: { type: "ARTICLE", status: ContentStatus.PUBLISHED, deletedAt: null },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true, slug: true, photo: true } },
          category: { select: { name: true, slug: true, accentColor: true } },
        },
      }),
      db.contentItem.findMany({
        where: { type: "POEM", status: ContentStatus.PUBLISHED, deletedAt: null },
        take: 2,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true, slug: true } },
        },
      }),
      db.contentItem.findMany({
        where: { type: "STORY", status: ContentStatus.PUBLISHED, deletedAt: null },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true, slug: true, photo: true } },
        },
      }),
      db.category.findMany({
        take: 6,
        include: {
          _count: {
            select: { contentItems: { where: { status: ContentStatus.PUBLISHED, deletedAt: null } } },
          },
        },
      }),
    ]);
    [authorProfile, featuredBooks, latestArticles, latestPoems, latestStories, categories] = results;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
  }

  const websiteSchema = generateWebSiteSchema();
  const authorName = authorProfile?.name || "HIUHU";

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={websiteSchema} />
      <Header user={user} />

      <main className="flex-1">
        {/* Author Folio Hero */}
        <Hero
          title={authorName}
          tagline="Where Voices Echo Through Time"
          description="The official literary home and personal archive of HIUHU. Exploring published books, poetics, architectural solitude, contemplative essays, and short fiction."
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-20 py-16">
          {/* Author Spotlight / Introduction */}
          {authorProfile && (
            <section className="p-8 sm:p-12 rounded-sm border border-parchment-300/80 dark:border-ink-800 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-amber-800/20 dark:border-amber-400/20 shadow-md">
                    {authorProfile.photo ? (
                      <img
                        src={authorProfile.photo}
                        alt={authorProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-parchment-200 dark:bg-ink-800 flex items-center justify-center font-serif text-5xl font-bold text-amber-800">
                        {authorProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
                      About the Author
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-parchment-100">
                      {authorProfile.name}
                    </h2>
                    {authorProfile.location && (
                      <p className="font-serif text-sm text-ink-500 dark:text-parchment-400 flex items-center justify-center md:justify-start gap-1.5 pt-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-700" />
                        {authorProfile.location}
                      </p>
                    )}
                  </div>

                  <p className="font-serif text-base text-ink-700 dark:text-parchment-300 leading-relaxed max-w-2xl">
                    {authorProfile.bio ||
                      "HIUHU is an author, poet, and essayist whose works explore architectural stillness, memory, and the interior landscape through long-form essays, poetry, and fiction."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <Link
                      href="/about"
                      className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5 hover:underline"
                    >
                      <span>Read Complete Biography & Manifesto</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <span className="text-ink-300 hidden sm:inline">•</span>

                    <span className="text-xs font-mono text-ink-500">
                      {authorProfile._count.books} Published Books • {authorProfile._count.contentItems} Written Works
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Published Books & Volumes */}
          {featuredBooks.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-parchment-300 dark:border-ink-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1">
                    Published Works
                  </span>
                  <h2 className="font-serif text-3xl font-bold">Books & Editions</h2>
                </div>
                <Link
                  href="/books"
                  className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5 hover:underline"
                >
                  <span>View All Books</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredBooks.map((book: any) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Selected Poetry & Verse */}
          {latestPoems.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-parchment-300 dark:border-ink-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1 flex items-center gap-1.5">
                    <Feather className="h-3.5 w-3.5" />
                    Poetics & Meter
                  </span>
                  <h2 className="font-serif text-3xl font-bold">Poetry & Verse</h2>
                </div>
                <Link
                  href="/poems"
                  className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5 hover:underline"
                >
                  <span>Read All Poetry</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestPoems.map((poem: any) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            </section>
          )}

          {/* Latest Articles & Essays */}
          {latestArticles.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-parchment-300 dark:border-ink-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1">
                    Essays & Criticism
                  </span>
                  <h2 className="font-serif text-3xl font-bold">Recent Essays</h2>
                </div>
                <Link
                  href="/articles"
                  className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5 hover:underline"
                >
                  <span>Browse All Essays</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestArticles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Short Stories & Fiction */}
          {latestStories.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-parchment-300 dark:border-ink-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1">
                    Narrative Prose
                  </span>
                  <h2 className="font-serif text-3xl font-bold">Short Fiction</h2>
                </div>
                <Link
                  href="/stories"
                  className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5 hover:underline"
                >
                  <span>Explore Stories</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestStories.map((story: any) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {/* Literary Themes & Categories */}
          {categories.length > 0 && (
            <section className="p-8 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 text-center space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-500 font-semibold">
                Themes & Inquiries
              </span>
              <h3 className="font-serif text-2xl font-bold">Literary Categories</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto pt-2">
                {categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/articles?category=${category.slug}`}
                    className="px-4 py-1.5 rounded-sm border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs font-mono text-ink-800 dark:text-parchment-200 hover:border-amber-700 hover:text-amber-800 transition-colors"
                  >
                    {category.name} ({category._count.contentItems})
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Author Newsletter Dispatch */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
