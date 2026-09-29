import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { contentItemSchema } from "@/lib/validations/content";
import { logAuditEvent } from "@/lib/audit";
import { ContentStatus, Role } from "@prisma/client";
import { canEditContent, canDeleteContent } from "@/lib/rbac";
import { calculateReadingTime } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await db.contentItem.findUnique({
      where: { id: params.id },
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!item || item.deletedAt) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.contentItem.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Role check: Author can only edit their own content!
    if (!canEditContent(user, existing.authorId)) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to edit this content" },
        { status: 403 }
      );
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

    // Authors cannot publish directly; status changes to PUBLISHED are reserved for SUPER_ADMIN or EDITOR
    if (user.role === Role.AUTHOR) {
      data.authorId = existing.authorId; // prevent changing author
      if (data.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED) {
        data.status = ContentStatus.PENDING_REVIEW;
      }
    }

    const readingTime = calculateReadingTime(data.content);

    let publishedAt = existing.publishedAt;
    if (data.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    }

    // Update tags: delete old and insert new
    await db.contentTag.deleteMany({
      where: { contentId: params.id },
    });

    const updated = await db.contentItem.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
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
        authorId: user.role === Role.AUTHOR ? existing.authorId : data.authorId,
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
      action: data.status === ContentStatus.PUBLISHED && existing.status !== ContentStatus.PUBLISHED
        ? "CONTENT_PUBLISH"
        : "CONTENT_UPDATE",
      entity: "ContentItem",
      entityId: updated.id,
      metadata: { title: updated.title, status: updated.status },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("[CONTENT PUT ERROR]:", error);
    return NextResponse.json({ error: error.message || "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.contentItem.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (!canDeleteContent(user, existing.authorId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft deletion
    await db.contentItem.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "CONTENT_DELETE",
      entity: "ContentItem",
      entityId: params.id,
      metadata: { title: existing.title },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Content archived / deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
