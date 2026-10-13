import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const search = searchParams.get("search");

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { metadata: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
