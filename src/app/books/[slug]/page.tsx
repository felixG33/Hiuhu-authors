import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { JsonLd } from "@/components/public/JsonLd";
import { generateBookSchema, constructMetadata } from "@/lib/seo";
import { BookOpen, ExternalLink, Calendar, BookMarked, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface BookPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BookPageProps) {
  const book = await db.book.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!book) return {};

  return constructMetadata({
    title: `${book.title} by ${book.author.name}`,
    description: book.description,
    image: book.cover || undefined,
    canonicalUrl: `/books/${book.slug}`,
    type: "book",
  });
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const user = await getCurrentUser();

  const book = await db.book.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
    },
  });

  if (!book || book.deletedAt) {
    notFound();
  }

  const bookSchema = generateBookSchema({
    title: book.title,
    description: book.description,
    cover: book.cover,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationDate: book.publicationDate,
    genre: book.genre,
    author: { name: book.author.name, slug: book.author.slug },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={bookSchema} />
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Book Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Book Cover (4 cols) */}
            <div className="md:col-span-5">
              <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-parchment-200 dark:bg-ink-800 border border-parchment-300 dark:border-ink-700 shadow-md">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <BookOpen className="h-16 w-16 text-amber-800/40 mb-4" />
                    <h2 className="font-serif text-xl font-bold">{book.title}</h2>
                    <p className="text-sm text-ink-600 mt-2">{book.author.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Book Metadata & Synopsis (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              <div>
                {book.genre && (
                  <Badge variant="gold" className="text-xs mb-3">
                    {book.genre}
                  </Badge>
                )}
                <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                  {book.title}
                </h1>
                <p className="font-serif text-lg text-ink-600 dark:text-parchment-300 mt-2">
                  Written by{" "}
                  <Link
                    href={`/authors/${book.author.slug}`}
                    className="text-ink-950 dark:text-parchment-50 font-semibold underline decoration-dotted hover:text-amber-800"
                  >
                    {book.author.name}
                  </Link>
                </p>
              </div>

              {/* Purchase / Acquisition Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {book.buyUrl && (
                  <a href={book.buyUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="gold" size="lg" className="gap-2">
                      <BookMarked className="h-4 w-4" />
                      Acquire Edition
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                {book.readUrl && (
                  <a href={book.readUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg">
                      Read Excerpt
                    </Button>
                  </a>
                )}
              </div>

              {/* Synopsis */}
              <div className="space-y-3 pt-4 border-t border-parchment-200 dark:border-ink-800">
                <h3 className="font-serif text-lg font-semibold">Synopsis & Description</h3>
                <div className="font-serif text-base text-ink-700 dark:text-parchment-300 leading-relaxed whitespace-pre-line">
                  {book.description}
                </div>
              </div>

              {/* Publication Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-parchment-200 dark:border-ink-800 text-xs font-mono text-ink-600 dark:text-parchment-400">
                <div>
                  <span className="block text-ink-400 uppercase text-[10px]">Publisher</span>
                  <span className="font-semibold text-ink-900 dark:text-parchment-100">{book.publisher || "HIUHU Press"}</span>
                </div>
                <div>
                  <span className="block text-ink-400 uppercase text-[10px]">Published</span>
                  <span className="font-semibold text-ink-900 dark:text-parchment-100">{formatDate(book.publicationDate)}</span>
                </div>
                <div>
                  <span className="block text-ink-400 uppercase text-[10px]">Length</span>
                  <span className="font-semibold text-ink-900 dark:text-parchment-100">{book.pages ? `${book.pages} pages` : "Hardcover Edition"}</span>
                </div>
                {book.isbn && (
                  <div>
                    <span className="block text-ink-400 uppercase text-[10px]">ISBN</span>
                    <span className="font-semibold text-ink-900 dark:text-parchment-100">{book.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Author Card Box */}
          <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-parchment-200 dark:bg-ink-800 border shrink-0">
                {book.author.photo ? (
                  <img src={book.author.photo} alt={book.author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-serif text-lg font-bold">
                    {book.author.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-400">About the Author</span>
                <h4 className="font-serif text-lg font-semibold">{book.author.name}</h4>
              </div>
            </div>
            <Link href={`/authors/${book.author.slug}`}>
              <Button variant="outline" size="sm">
                View Author Profile
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
