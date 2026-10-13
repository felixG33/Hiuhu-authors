import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const items = await db.navigationItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch navigation" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const { label, path, location = "HEADER", order = 0, isEnabled = true, openInNewTab = false } = await req.json();

    if (!label || !path) {
      return NextResponse.json({ error: "Label and path are required" }, { status: 400 });
    }

    const item = await db.navigationItem.create({
      data: { label, path, location, order, isEnabled, openInNewTab },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "NAVIGATION_CREATE",
      entity: "NavigationItem",
      entityId: item.id,
      metadata: { label, path },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create navigation item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const { items } = await req.json(); // Array of navigation items to update order/visibility

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          await db.navigationItem.update({
            where: { id: item.id },
            data: {
              label: item.label,
              path: item.path,
              order: item.order,
              isEnabled: item.isEnabled,
              openInNewTab: item.openInNewTab,
            },
          });
        }
      }
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "NAVIGATION_UPDATE",
      entity: "NavigationItem",
      metadata: { updatedCount: items?.length || 0 },
    });

    return NextResponse.json({ success: true, message: "Navigation updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update navigation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.navigationItem.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "NAVIGATION_DELETE",
      entity: "NavigationItem",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 });
  }
}
