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
import { Clock, Calendar, ArrowLeft, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ContentStatus } from "@prisma/client";

interface StoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: StoryPageProps) {
  const story = await db.contentItem.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!story) return {};

  return constructMetadata({
    title: `${story.title} — Story by ${story.author.name}`,
    description: story.excerpt || undefined,
    image: story.coverImage || undefined,
    canonicalUrl: `/stories/${story.slug}`,
    type: "article",
  });
}

export default async function StoryReadingPage({ params }: StoryPageProps) {
  const user = await getCurrentUser();

  const story = await db.contentItem.findUnique({
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

  if (!story || story.deletedAt || story.type !== "STORY" || story.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  // Increment views
  await db.contentItem.update({
    where: { id: story.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  const schema = generateArticleSchema({
    title: story.title,
    excerpt: story.excerpt,
    coverImage: story.coverImage,
    slug: story.slug,
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt,
    author: { name: story.author.name, slug: story.author.slug },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={schema} />
      <Header user={user} />

      <main className="flex-1 py-12 md:py-20">
        <article className="container mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-500 hover:text-amber-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Short Stories</span>
          </Link>

          <header className="space-y-6 text-center sm:text-left mb-12">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Badge variant="gold" className="text-xs">
                Short Fiction
              </Badge>
              <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {story.readingTimeMinutes} min read
              </span>
              <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(story.publishedAt)}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              {story.title}
            </h1>

            {story.excerpt && (
              <p className="font-serif text-lg text-ink-600 dark:text-parchment-300 leading-relaxed italic border-l-2 border-amber-800/40 pl-4">
                {story.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-parchment-300 dark:border-ink-800 gap-4">
              <Link href={`/authors/${story.author.slug}`} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-parchment-200 dark:bg-ink-800 border">
                  {story.author.photo ? (
                    <img src={story.author.photo} alt={story.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-serif text-base font-bold">
                      {story.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-sm">{story.author.name}</h4>
                  <p className="text-xs text-ink-500 font-mono">Author</p>
                </div>
              </Link>
              <BookmarkButton contentItemId={story.id} title={story.title} />
            </div>
          </header>

          {story.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden mb-12 border border-parchment-300 dark:border-ink-800">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="editorial-prose text-ink-900 dark:text-parchment-100 whitespace-pre-line text-lg leading-[1.85] font-serif border-b border-parchment-300 dark:border-ink-800 pb-12">
            {story.content}
          </div>

          <CommentSection
            contentItemId={story.id}
            comments={story.comments}
            allowComments={story.allowComments}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
