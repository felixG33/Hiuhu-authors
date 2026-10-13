import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BookCard } from "@/components/public/BookCard";
import { constructMetadata } from "@/lib/seo";
import { Search } from "lucide-react";

export const metadata = constructMetadata({
  title: "Book Catalog & Editions",
  description: "Browse published literary editions, novels, and poetry collections from HIUHU Press.",
  canonicalUrl: "/books",
});

interface BooksPageProps {
  searchParams: { q?: string; genre?: string };
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const user = await getCurrentUser();
  const query = searchParams.q || "";
  const genre = searchParams.genre || "";

  const where: any = {
    deletedAt: null,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { author: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (genre) {
    where.genre = { contains: genre, mode: "insensitive" };
  }

  const books = await db.book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, slug: true },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
              Author Bibliography
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold">Books & Editions</h1>
            <p className="font-serif text-base text-ink-600 dark:text-parchment-300 leading-relaxed">
              Explore published volumes, poetry chapbooks, and novels authored by HIUHU.
            </p>

            {/* Filter Search */}
            <form method="GET" action="/books" className="relative max-w-md pt-2">
              <Search className="absolute left-3.5 top-5.5 h-4 w-4 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search by title, author, or keyword..."
                className="w-full h-11 pl-10 pr-4 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </form>
          </div>

          {/* Book Grid */}
          {books.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-parchment-300 dark:border-ink-800 rounded-sm">
              <p className="font-serif text-lg text-ink-600 dark:text-parchment-400">
                No editions found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}