import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { role } = await req.json();

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Prevent changing the role of the platform's initial super admin if it's the only one
    const updated = await db.user.update({
      where: { id: params.id },
      data: { role },
    });

    await logAuditEvent({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "USER_ROLE_CHANGE",
      entity: "User",
      entityId: targetUser.id,
      metadata: { previousRole: targetUser.role, newRole: role, targetUserEmail: targetUser.email },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    if (currentUser.id === params.id) {
      return NextResponse.json({ error: "You cannot delete your own active administrator account" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.user.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "USER_DELETE",
      entity: "User",
      entityId: params.id,
      metadata: { deletedEmail: targetUser.email },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "User account deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
