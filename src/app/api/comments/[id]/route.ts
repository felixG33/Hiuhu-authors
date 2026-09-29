import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CommentStatus, Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden: Moderators only" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!Object.values(CommentStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid comment status" }, { status: 400 });
    }

    const updated = await db.comment.update({
      where: { id: params.id },
      data: { status },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "COMMENT_MODERATE",
      entity: "Comment",
      entityId: params.id,
      metadata: { newStatus: status },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update comment status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden: Moderators only" }, { status: 403 });
    }

    await db.comment.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "COMMENT_DELETE",
      entity: "Comment",
      entityId: params.id,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
