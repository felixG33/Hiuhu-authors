import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BookmarkButton } from "@/components/public/BookmarkButton";
import { CommentSection } from "@/components/public/CommentSection";
import { JsonLd } from "@/components/public/JsonLd";
import { generateArticleSchema, constructMetadata } from "@/lib/seo";
import { Feather, ArrowLeft, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ContentStatus } from "@prisma/client";

interface PoemPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PoemPageProps) {
  const poem = await db.contentItem.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!poem) return {};

  return constructMetadata({
    title: `${poem.title} — Poem by ${poem.author.name}`,
    description: poem.excerpt || `A poem by ${poem.author.name} on HIUHU Press.`,
    image: poem.coverImage || undefined,
    canonicalUrl: `/poems/${poem.slug}`,
    type: "article",
  });
}

export default async function PoemReadingPage({ params }: PoemPageProps) {
  const user = await getCurrentUser();

  const poem = await db.contentItem.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });

  if (!poem || poem.deletedAt || poem.type !== "POEM" || poem.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  // Increment views
  await db.contentItem.update({
    where: { id: poem.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  const schema = generateArticleSchema({
    title: poem.title,
    excerpt: poem.excerpt,
    coverImage: poem.coverImage,
    slug: poem.slug,
    publishedAt: poem.publishedAt,
    updatedAt: poem.updatedAt,
    author: { name: poem.author.name, slug: poem.author.slug },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={schema} />
      <Header user={user} />

      <main className="flex-1 py-12 md:py-20">
        <article className="container mx-auto max-w-2xl px-4 sm:px-6">
          <Link
            href="/poems"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-500 hover:text-amber-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Poetry</span>
          </Link>

          <header className="space-y-4 text-center pb-8 border-b border-parchment-300 dark:border-ink-800">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <Feather className="h-3.5 w-3.5" />
              Poetic Verse
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              {poem.title}
            </h1>

            <p className="font-serif text-base text-ink-600 dark:text-parchment-300">
              by{" "}
              <Link
                href={`/authors/${poem.author.slug}`}
                className="text-ink-950 dark:text-parchment-50 font-semibold underline decoration-dotted hover:text-amber-800"
              >
                {poem.author.name}
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-xs font-mono text-ink-500 pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(poem.publishedAt)}
              </span>
              <BookmarkButton contentItemId={poem.id} title={poem.title} />
            </div>
          </header>

          {/* Verses Container (Preserving intentional line breaks and stanza spacing) */}
          <div className="py-12 my-6 font-serif text-lg sm:text-xl text-ink-900 dark:text-parchment-100 whitespace-pre-wrap leading-[2.1] tracking-wide text-center sm:text-left border-b border-parchment-300 dark:border-ink-800 max-w-md mx-auto">
            {poem.content}
          </div>

          {/* Comments */}
          <CommentSection
            contentItemId={poem.id}
            comments={poem.comments}
            allowComments={poem.allowComments}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
