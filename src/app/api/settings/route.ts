import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const body = await req.json(); // Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "SETTINGS_UPDATE",
      entity: "SiteSetting",
      metadata: body,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
