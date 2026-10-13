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
import { Clock, Calendar, ArrowLeft, Share2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ContentStatus } from "@prisma/client";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await db.contentItem.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!article) return {};

  return constructMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    image: article.ogImage || article.coverImage || undefined,
    canonicalUrl: `/articles/${article.slug}`,
    type: "article",
  });
}

export default async function ArticleReadingPage({ params }: ArticlePageProps) {
  const user = await getCurrentUser();

  const article = await db.contentItem.findUnique({
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

  if (!article || article.deletedAt || article.type !== "ARTICLE" || article.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  // Increment views count asynchronously
  await db.contentItem.update({
    where: { id: article.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  const articleSchema = generateArticleSchema({
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    slug: article.slug,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: { name: article.author.name, slug: article.author.slug },
  });

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <JsonLd data={articleSchema} />
      <Header user={user} />

      <main className="flex-1 py-12 md:py-20">
        <article className="container mx-auto max-w-3xl px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-500 hover:text-amber-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Essays</span>
          </Link>

          {/* Article Header */}
          <header className="space-y-6 text-center sm:text-left mb-12">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {article.category && (
                <Badge variant="gold" className="text-xs">
                  {article.category.name}
                </Badge>
              )}
              <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readingTimeMinutes} min read
              </span>
              <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-ink-950 dark:text-parchment-50">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="font-serif text-lg sm:text-xl text-ink-600 dark:text-parchment-300 leading-relaxed italic border-l-2 border-amber-800/40 pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Author Byline & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-parchment-300 dark:border-ink-800 gap-4">
              <Link
                href={`/authors/${article.author.slug}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-parchment-200 dark:bg-ink-800 border">
                  {article.author.photo ? (
                    <img src={article.author.photo} alt={article.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-serif text-base font-bold">
                      {article.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-sm group-hover:text-amber-800 transition-colors">
                    {article.author.name}
                  </h4>
                  <p className="text-xs text-ink-500 font-mono">Resident Contributor</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <BookmarkButton contentItemId={article.id} title={article.title} />
              </div>
            </div>
          </header>

          {/* Cover Hero Image */}
          {article.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden mb-12 border border-parchment-300 dark:border-ink-800 shadow-xs">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Body Content */}
          <div className="editorial-prose text-ink-900 dark:text-parchment-100 whitespace-pre-line text-lg leading-[1.85] font-serif border-b border-parchment-300 dark:border-ink-800 pb-12">
            {article.content}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6">
              <span className="text-xs font-mono text-ink-500">Filed under:</span>
              {article.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 rounded-xs bg-parchment-200 dark:bg-ink-800 text-xs font-mono text-ink-700 dark:text-parchment-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <CommentSection
            contentItemId={article.id}
            comments={article.comments}
            allowComments={article.allowComments}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}