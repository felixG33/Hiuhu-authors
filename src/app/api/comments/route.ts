import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validations/contact";
import { CommentStatus, Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentItemId = searchParams.get("contentItemId");
    const status = searchParams.get("status") as CommentStatus | null;

    const user = await getCurrentUser();
    const isModerator = user && (user.role === Role.SUPER_ADMIN || user.role === Role.EDITOR);

    const where: any = {};
    if (contentItemId) where.contentItemId = contentItemId;

    if (!isModerator) {
      // Public only sees approved comments
      where.status = CommentStatus.APPROVED;
    } else if (status) {
      where.status = status;
    }

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        contentItem: {
          select: { id: true, title: true, slug: true, type: true },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = commentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { contentItemId, content, authorName, authorEmail } = validated.data;

    // Verify content exists and allows comments
    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!contentItem || contentItem.deletedAt) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    if (!contentItem.allowComments) {
      return NextResponse.json({ error: "Comments are disabled for this publication" }, { status: 403 });
    }

    const user = await getCurrentUser();

    // Check if auto-approve setting is enabled in site settings
    const commentSetting = await db.siteSetting.findUnique({
      where: { key: "comments_require_approval" },
    });
    const requireApproval = commentSetting ? commentSetting.value === "true" : true;

    const comment = await db.comment.create({
      data: {
        content,
        contentItemId,
        authorName: user ? user.name : authorName || "Anonymous Reader",
        authorEmail: user ? user.email : authorEmail || null,
        userId: user ? user.id : null,
        status: requireApproval ? CommentStatus.PENDING : CommentStatus.APPROVED,
      },
    });

    return NextResponse.json({
      success: true,
      comment,
      message: requireApproval
        ? "Comment submitted for editorial review"
        : "Comment published",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post comment" }, { status: 500 });
  }
}
