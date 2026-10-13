import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === Role.READER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalAuthors,
      totalBooks,
      publishedArticles,
      publishedPoems,
      publishedStories,
      pendingDrafts,
      pendingComments,
      recentLogs,
    ] = await Promise.all([
      db.authorProfile.count(),
      db.book.count({ where: { deletedAt: null } }),
      db.contentItem.count({ where: { type: "ARTICLE", status: "PUBLISHED", deletedAt: null } }),
      db.contentItem.count({ where: { type: "POEM", status: "PUBLISHED", deletedAt: null } }),
      db.contentItem.count({ where: { type: "STORY", status: "PUBLISHED", deletedAt: null } }),
      db.contentItem.count({ where: { status: "DRAFT", deletedAt: null } }),
      db.comment.count({ where: { status: "PENDING" } }),
      db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    ]);

    const topAuthors = await db.authorProfile.findMany({
      take: 4,
      orderBy: { contentItems: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        slug: true,
        photo: true,
        _count: {
          select: { contentItems: true, books: true },
        },
      },
    });

    const popularContent = await db.contentItem.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      take: 5,
      orderBy: { viewsCount: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        viewsCount: true,
        author: { select: { name: true } },
      },
    });

    return NextResponse.json({
      metrics: {
        totalAuthors,
        totalBooks,
        publishedArticles,
        publishedPoems,
        publishedStories,
        totalPublished: publishedArticles + publishedPoems + publishedStories,
        pendingDrafts,
        pendingComments,
      },
      topAuthors,
      popularContent,
      recentLogs,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
