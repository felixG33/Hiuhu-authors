import React from "react";
import Link from "next/link";
import { db, withDbRetry } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { constructMetadata } from "@/lib/seo";
import { Feather, BookOpen, MapPin, Globe, Instagram, Mail, ArrowRight } from "lucide-react";
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
    [user, author] = await withDbRetry(() =>
      Promise.all([
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
      ])
    );
  } catch (error) {
    console.error("Error fetching author in AboutPage:", error);
  }

  if (!author) {
    author = {
      id: "hiuhu-author-root",
      name: "HIUHU",
      slug: "hiuhu",
      photo: "/author.jpg",
      bio: "HIUHU is an author, poet, and literary essayist exploring memory, architectural stillness, and the human spirit across long-form essays, poetry, and contemplative fiction. Based between Nairobi kenya.",
      location: "Nairobi kenya",
      website: "https://hiuhu.org",
      twitter: null,
      instagram: "@hiuhu_isaac",
      whatsapp: "@arch_hiuhuisaac",
      genres: "Poetry, literal fiction and articles",
      books: [],
      _count: {
        books: 3,
        contentItems: 6,
      },
    };
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
                {author?.instagram && (
                  <a
                    href={`https://instagram.com/${author.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-800 flex items-center gap-1"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>{author.instagram}</span>
                  </a>
                )}
                {author?.whatsapp && (
                  <a
                    href={`https://wa.me/${author.whatsapp.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-800 flex items-center gap-1"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>{author.whatsapp}</span>
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
                "HIUHU is an independent writer, whose work is dedicated to exploring the subtle acoustics of life, the quiet power of architecture, and the emotional resonance of modern solitude. Writing from between Nairobi, KENYA."}
            </p>
            <p>
               HIUHU treats the printed page as an architectural space designed for patient contemplation rather than hurried digital consumption.
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
