import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type") || "all"; // all, author, book, article, poem, story

    if (!query) {
      return NextResponse.json({
        authors: [],
        books: [],
        articles: [],
        poems: [],
        stories: [],
        total: 0,
      });
    }

    const results: any = {
      authors: [],
      books: [],
      articles: [],
      poems: [],
      stories: [],
      total: 0,
    };

    // 1. Search Authors
    if (type === "all" || type === "author") {
      results.authors = await db.authorProfile.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
            { genres: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        select: { id: true, name: true, slug: true, photo: true, bio: true, location: true, genres: true },
      });
    }

    // 2. Search Books
    if (type === "all" || type === "book") {
      results.books = await db.book.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { genre: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: {
          author: { select: { name: true, slug: true } },
        },
      });
    }

    // 3. Search Articles
    if (type === "all" || type === "article") {
      results.articles = await db.contentItem.findMany({
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          type: "ARTICLE",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: {
          author: { select: { name: true, slug: true, photo: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    }

    // 4. Search Poems
    if (type === "all" || type === "poem") {
      results.poems = await db.contentItem.findMany({
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          type: "POEM",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: {
          author: { select: { name: true, slug: true } },
        },
      });
    }

    // 5. Search Stories
    if (type === "all" || type === "story") {
      results.stories = await db.contentItem.findMany({
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          type: "STORY",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: {
          author: { select: { name: true, slug: true, photo: true } },
        },
      });
    }

    results.total =
      results.authors.length +
      results.books.length +
      results.articles.length +
      results.poems.length +
      results.stories.length;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
