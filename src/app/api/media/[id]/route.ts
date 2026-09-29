import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden: Editors and Super Admins only" }, { status: 403 });
    }

    const item = await db.media.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    if (item.storageKey) {
      await deleteFile(item.storageKey);
    }

    await db.media.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "MEDIA_DELETE",
      entity: "Media",
      entityId: params.id,
      metadata: { filename: item.filename },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
