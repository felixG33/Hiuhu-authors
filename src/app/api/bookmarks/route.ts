import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ bookmarks: [] });
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      include: {
        contentItem: {
          include: {
            author: { select: { name: true, slug: true, photo: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentItemId } = await req.json();

    const existing = await db.bookmark.findUnique({
      where: {
        userId_contentItemId: {
          userId: user.id,
          contentItemId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId: user.id,
        contentItemId,
      },
    });

    return NextResponse.json({ bookmarked: true, bookmark });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
