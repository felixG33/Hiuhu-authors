import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { contentItemSchema } from "@/lib/validations/content";
import { logAuditEvent } from "@/lib/audit";
import { ContentType, ContentStatus, Role } from "@prisma/client";
import { generateUniqueContentSlug } from "@/lib/slug";
import { calculateReadingTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as ContentType | null;
    const status = searchParams.get("status") as ContentStatus | null;
    const authorId = searchParams.get("authorId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const user = await getCurrentUser();

    const where: any = {
      deletedAt: null,
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role-based visibility enforcement
    if (!user || user.role === Role.READER) {
      // Public / Reader: only published content
      where.status = ContentStatus.PUBLISHED;
      where.publishedAt = { lte: new Date() };
    } else if (user.role === Role.AUTHOR) {
      // Author: can see all published works OR their own drafts
      if (!where.status) {
        where.OR = [
          { status: ContentStatus.PUBLISHED },
          { authorId: user.authorProfileId },
        ];
      } else if (where.status !== ContentStatus.PUBLISHED) {
        where.authorId = user.authorProfileId;
      }
    }
    // SUPER_ADMIN and EDITOR see all

    const items = await db.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, slug: true, photo: true },
        },
        category: {
          select: { id: true, name: true, slug: true, accentColor: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[CONTENT GET ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === Role.READER) {
      return NextResponse.json({ error: "Forbidden: Authors, Editors, or Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const validated = contentItemSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Enforce author assignment
    if (user.role === Role.AUTHOR) {
      if (!user.authorProfileId) {
        return NextResponse.json({ error: "No author profile found for this user account" }, { status: 400 });
      }
      data.authorId = user.authorProfileId;
      // Authors cannot directly publish; they must submit for review
      if (data.status === ContentStatus.PUBLISHED) {
        data.status = ContentStatus.PENDING_REVIEW;
      }
    }

    const slug = await generateUniqueContentSlug(data.slug || data.title);
    const readingTime = calculateReadingTime(data.content);

    const publishedAt =
      data.status === ContentStatus.PUBLISHED
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : null;

    const contentItem = await db.contentItem.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        type: data.type,
        status: data.status,
        publishedAt,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        isFeatured: data.isFeatured,
        allowComments: data.allowComments,
        readingTimeMinutes: readingTime,
        authorId: data.authorId,
        categoryId: data.categoryId || null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        ogImage: data.ogImage,
        tags: {
          create: (data.tagIds || []).map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "CONTENT_CREATE",
      entity: "ContentItem",
      entityId: contentItem.id,
      metadata: { title: contentItem.title, type: contentItem.type, status: contentItem.status },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, item: contentItem }, { status: 201 });
  } catch (error: any) {
    console.error("[CONTENT POST ERROR]:", error);
    return NextResponse.json({ error: error.message || "Failed to create content" }, { status: 500 });
  }
}
