import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "seo_config" },
    });

    const defaultConfig = {
      defaultTitle: "HIUHU — A Literary Sanctuary",
      defaultDescription: "An independent publishing platform for discerning authors and readers.",
      defaultKeywords: "authors, literature, poetry, essays, books, publishing, HIUHU",
      defaultOgImage: "/og-image.png",
      twitterHandle: "@HIUHUpress",
      schemaOrganization: "HIUHU Press",
    };

    if (!setting) {
      return NextResponse.json({ config: defaultConfig });
    }

    return NextResponse.json({ config: { ...defaultConfig, ...JSON.parse(setting.value) } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch SEO config" }, { status: 500 });
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
      where: { key: "seo_config" },
      update: { value: JSON.stringify(body) },
      create: {
        key: "seo_config",
        value: JSON.stringify(body),
        description: "Global site SEO, meta tags, and structured data configuration",
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "SEO_CONFIG_UPDATE",
      entity: "SiteSetting",
      entityId: updated.id,
      metadata: body,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update SEO configuration" }, { status: 500 });
  }
}
