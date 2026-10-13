import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { constructMetadata } from "@/lib/seo";
import { Feather, BookOpen, MapPin, Globe, Twitter, Instagram, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = constructMetadata({
  title: "About HIUHU — Author, Poet & Essayist",
  description: "Biography, literary background, artistic manifesto, and published bibliography of author HIUHU.",
  canonicalUrl: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let user = null;
  let author: any = null;

  try {
    [user, author] = await Promise.all([
      getCurrentUser(),
      db.authorProfile.findFirst({
        orderBy: { isFeatured: "desc" },
        include: {
          books: { where: { deletedAt: null }, orderBy: { publicationDate: "desc" } },
          _count: {
            select: { contentItems: true, books: true },
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Error fetching author in AboutPage:", error);
  }

  const authorName = author?.name || "HIUHU";

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-16">
          {/* Author Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 border-b border-parchment-300 dark:border-ink-800 pb-12">
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-amber-800/20 shadow-lg shrink-0">
              {author?.photo ? (
                <img
                  src={author.photo}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-parchment-200 dark:bg-ink-800 flex items-center justify-center font-serif text-5xl font-bold text-amber-800">
                  {authorName.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1">
                  Biography & Folio
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink-900 dark:text-parchment-100">
                  {authorName}
                </h1>
                <p className="font-serif text-lg text-amber-900 dark:text-amber-400 font-medium italic mt-1">
                  Author, Poet & Literary Essayist
                </p>
              </div>

              {author?.location && (
                <p className="font-serif text-sm text-ink-500 dark:text-parchment-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-700" />
                  {author.location}
                </p>
              )}

              {/* Social Channels */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-ink-600 dark:text-parchment-300 text-xs font-mono pt-1">
                {author?.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-800 flex items-center gap-1"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Website</span>
                  </a>
                )}
                {author?.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-800 flex items-center gap-1"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    <span>{author.twitter}</span>
                  </a>
                )}
                {author?.instagram && (
                  <a
                    href={`https://instagram.com/${author.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-800 flex items-center gap-1"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Author Biography Body */}
          <div className="space-y-6 font-serif text-base sm:text-lg text-ink-800 dark:text-parchment-200 leading-relaxed">
            <h2 className="text-2xl font-bold font-serif text-ink-900 dark:text-parchment-100">
              Literary Background & Journey
            </h2>
            <p>
              {author?.bio ||
                "HIUHU is an independent writer, poet, and essayist whose work is dedicated to exploring the subtle acoustics of memory, the quiet power of architecture, and the emotional resonance of modern solitude. Writing from between London and Kyoto, their work combines formal linguistic precision with deep philosophical inquiry."}
            </p>
            <p>
              With multiple published volumes spanning poetry collections, speculative fiction, and critical essays on twentieth-century prose, HIUHU treats the printed page as an architectural space designed for patient contemplation rather than hurried digital consumption.
            </p>
          </div>

          {/* Artistic Manifesto */}
          <div className="p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 space-y-4 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block">
              The Author&apos;s Manifesto
            </span>
            <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-parchment-100">
              On the Primacy of Craft and Stillness
            </h3>
            <p className="font-serif text-base text-ink-700 dark:text-parchment-300 leading-relaxed italic">
              &ldquo;Writing is not the recording of noise, but the quiet shaping of stillness. When every digital channel is engineered for urgency and acceleration, literature must remain the deliberate counterweight—a sanctuary where sentences breathe, where stanzas hold their silence, and where the human heart can listen.&rdquo;
            </p>
          </div>

          {/* Published Books Spotlight */}
          {author?.books && author.books.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-3">
                <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-parchment-100">
                  Published Books & Editions
                </h3>
                <Link href="/books" className="text-xs font-mono uppercase tracking-wider text-amber-800 hover:underline">
                  View Catalog &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {author.books.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 flex gap-4 items-start"
                  >
                    {b.cover && (
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="w-16 h-24 object-cover rounded-xs border border-parchment-300 shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-100">
                        {b.title}
                      </h4>
                      <p className="font-mono text-xs text-ink-500">
                        {b.publisher || "HIUHU"} • {b.publicationDate ? new Date(b.publicationDate).getFullYear() : "2026"}
                      </p>
                      <p className="font-serif text-xs text-ink-600 dark:text-parchment-400 line-clamp-2">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Inquiry Callout */}
          <div className="text-center space-y-4 border-t border-parchment-300 dark:border-ink-800 pt-12">
            <h3 className="font-serif text-2xl font-bold">Literary Inquiries & Correspondence</h3>
            <p className="font-serif text-sm text-ink-600 dark:text-parchment-300 max-w-md mx-auto">
              For reading engagements, rights inquiries, or personal correspondence with the author.
            </p>
            <Link href="/contact">
              <Button variant="gold" size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact HIUHU
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
