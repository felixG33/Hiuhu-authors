import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BookCard } from "@/components/public/BookCard";
import { ArticleCard } from "@/components/public/ArticleCard";
import { PoemCard } from "@/components/public/PoemCard";
import { StoryCard } from "@/components/public/StoryCard";
import { JsonLd } from "@/components/public/JsonLd";
import { generateAuthorSchema, constructMetadata } from "@/lib/seo";
import { MapPin, Globe, Twitter, Instagram, Linkedin, BookOpen, Feather, Bookmark, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ContentStatus } from "@prisma/client";

interface AuthorPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const author = await db.authorProfile.findUnique({
    where: { slug: params.slug },
  });

  if (!author) return {};

  return constructMetadata({
    title: author.name,
    description: author.bio || `${author.name} is a published author at HIUHU Press.`,
    image: author.photo || undefined,
    canonicalUrl: `/authors/${author.slug}`,
    type: "profile",
  });
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const user = await getCurrentUser();

  const author = await db.authorProfile.findUnique({
    where: { slug: params.slug },
    include: {
      books: {
        where: { deletedAt: null },
        orderBy: { publicationDate: "desc" },
      },
      contentItems: {
        where: { status: ContentStatus.PUBLISHED, deletedAt: null },
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { name: true, slug: true, accentColor: true } },
        },
      },
    },
  });

  if (!author) {
    notFound();
  }

  const articles = author.contentItems.filter((i) => i.type === "ARTICLE");
  const poems = author.contentItems.filter((i) => i.type === "POEM");
  const stories = author.contentItems.filter((i) => i.type === "STORY");

  const authorSchema = generateAuthorSchema({
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    photo: author.photo,
    website: author.website,
    instagram: author.instagram,
    location: author.location,
  });

  const genresList = author.genres
    ? author.genres.split(",").map((g) => g.trim())
    : [];

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={authorSchema} />
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          {/* Author Header Bio Card */}
          <div className="p-8 sm:p-12 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 shadow-xs flex flex-col md:flex-row gap-8 items-start">
            {/* Portrait */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shrink-0 border-2 border-parchment-300 dark:border-ink-700 bg-parchment-200 dark:bg-ink-800 shadow-sm">
              {author.photo ? (
                <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-3xl font-bold text-ink-700">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                {author.isFeatured && (
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold mb-1 block">
                    Featured Resident Author
                  </span>
                )}
                <h1 className="font-serif text-3xl sm:text-4xl font-bold">{author.name}</h1>
                {author.location && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-ink-500 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{author.location}</span>
                  </div>
                )}
              </div>

              {author.bio && (
                <p className="font-serif text-base text-ink-700 dark:text-parchment-300 leading-relaxed whitespace-pre-line">
                  {author.bio}
                </p>
              )}

              {/* Genres */}
              {genresList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {genresList.map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {/* External & Social Links */}
              <div className="flex items-center gap-4 pt-2 text-xs font-mono text-ink-600 dark:text-parchment-400">
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-amber-800"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Website</span>
                  </a>
                )}
                {author.instagram && (
                  <a
                    href={`https://instagram.com/${author.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-amber-800"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>{author.instagram}</span>
                  </a>
                )}
                {author.whatsapp && (
                  <a
                    href={`https://wa.me/${author.whatsapp.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-amber-800"
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

          {/* Published Works Sections */}
          <div className="space-y-16">
            {/* Books */}
            {author.books.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-parchment-300 dark:border-ink-800 pb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                  <h2 className="font-serif text-2xl font-bold">Books & Editions ({author.books.length})</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {author.books.map((b) => (
                    <BookCard key={b.id} book={{ ...b, author: { name: author.name, slug: author.slug } }} />
                  ))}
                </div>
              </section>
            )}

            {/* Articles & Essays */}
            {articles.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-parchment-300 dark:border-ink-800 pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                  <h2 className="font-serif text-2xl font-bold">Articles & Essays ({articles.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((item) => (
                    <ArticleCard key={item.id} article={{ ...item, author }} />
                  ))}
                </div>
              </section>
            )}

            {/* Poems */}
            {poems.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-parchment-300 dark:border-ink-800 pb-3 flex items-center gap-2">
                  <Feather className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                  <h2 className="font-serif text-2xl font-bold">Poems & Verse ({poems.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {poems.map((poem) => (
                    <PoemCard key={poem.id} poem={{ ...poem, author }} />
                  ))}
                </div>
              </section>
            )}

            {/* Stories */}
            {stories.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-parchment-300 dark:border-ink-800 pb-3 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                  <h2 className="font-serif text-2xl font-bold">Short Fiction ({stories.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={{ ...story, author }} />
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
