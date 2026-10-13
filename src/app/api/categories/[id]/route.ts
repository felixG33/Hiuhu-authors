import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/taxonomy";
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
    const validated = categorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const slug = data.slug || slugify(data.name);

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        accentColor: data.accentColor,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "CATEGORY_UPDATE",
      entity: "Category",
      entityId: category.id,
      metadata: { name: category.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const category = await db.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { contentItems: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.contentItems > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.contentItems} attached items. Reassign them first.` },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "CATEGORY_DELETE",
      entity: "Category",
      entityId: params.id,
      metadata: { name: category.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
