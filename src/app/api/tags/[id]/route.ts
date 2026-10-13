import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/taxonomy";
import { slugify } from "@/lib/utils";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = tagSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const slug = data.slug || slugify(data.name);

    const tag = await db.tag.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "TAG_UPDATE",
      entity: "Tag",
      entityId: tag.id,
      metadata: { name: tag.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, tag });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tag = await db.tag.findUnique({
      where: { id: params.id },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Delete associated content tags first if any
    await db.contentTag.deleteMany({
      where: { tagId: params.id },
    });

    await db.tag.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "TAG_DELETE",
      entity: "Tag",
      entityId: params.id,
      metadata: { name: tag.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Tag deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete tag" }, { status: 500 });
  }
}
