import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

const DEFAULT_HOMEPAGE_CONFIG = {
  heroTitle: "Where Voices Echo Through Time",
  heroDescription:
    "HIUHU is an independent literary sanctuary celebrating visionary authors, evocative poetry, transformative fiction, and profound essays.",
  heroImage: "",
  sections: [
    { id: "hero", name: "Hero Section", enabled: true, order: 1 },
    { id: "featured_authors", name: "Featured Authors", enabled: true, order: 2 },
    { id: "featured_books", name: "Featured Books", enabled: true, order: 3 },
    { id: "latest_articles", name: "Latest Articles & Essays", enabled: true, order: 4 },
    { id: "latest_poems", name: "Poetry & Verse", enabled: true, order: 5 },
    { id: "latest_stories", name: "Short Fiction", enabled: true, order: 6 },
    { id: "genres_cloud", name: "Literary Categories & Genres", enabled: true, order: 7 },
    { id: "newsletter", name: "Newsletter Dispatch", enabled: true, order: 8 },
  ],
};

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "homepage_config" },
    });

    if (!setting) {
      return NextResponse.json({ config: DEFAULT_HOMEPAGE_CONFIG });
    }

    return NextResponse.json({ config: JSON.parse(setting.value) });
  } catch (error) {
    return NextResponse.json({ config: DEFAULT_HOMEPAGE_CONFIG });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Super Administrator only" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await db.siteSetting.upsert({
      where: { key: "homepage_config" },
      update: { value: JSON.stringify(body) },
      create: {
        key: "homepage_config",
        value: JSON.stringify(body),
        description: "Homepage layout and section visibility configuration",
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "HOMEPAGE_CONFIG_UPDATE",
      entity: "SiteSetting",
      entityId: updated.id,
      metadata: body,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, config: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update homepage settings" }, { status: 500 });
  }
}
