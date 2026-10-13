import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { PoemCard } from "@/components/public/PoemCard";
import { constructMetadata } from "@/lib/seo";
import { Feather, Search } from "lucide-react";
import { ContentStatus } from "@prisma/client";

export const metadata = constructMetadata({
  title: "Poetry & Verse",
  description: "A sanctuary of contemporary poetry, elegies, and structural verse published by HIUHU Press.",
  canonicalUrl: "/poems",
});

interface PoemsPageProps {
  searchParams: { q?: string };
}

export default async function PoemsPage({ searchParams }: PoemsPageProps) {
  const user = await getCurrentUser();
  const query = searchParams.q || "";

  const where: any = {
    type: "POEM",
    status: ContentStatus.PUBLISHED,
    deletedAt: null,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { author: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const poems = await db.contentItem.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <Feather className="h-3.5 w-3.5" />
              Poetics & Meter
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold">Poetry & Verse</h1>
            <p className="font-serif text-base text-ink-600 dark:text-parchment-300 leading-relaxed">
              Read contemporary verse crafted with care for line breaks, cadence, stanza structure, and the lyric voice.
            </p>

            {/* Filter Search */}
            <form method="GET" action="/poems" className="relative max-w-md pt-2">
              <Search className="absolute left-3.5 top-5.5 h-4 w-4 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search poetry by line or author..."
                className="w-full h-11 pl-10 pr-4 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </form>
          </div>

          {/* Grid */}
          {poems.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-parchment-300 dark:border-ink-800 rounded-sm">
              <p className="font-serif text-lg text-ink-600 dark:text-parchment-400">
                No poems found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
