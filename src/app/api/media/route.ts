import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile, validateFile } from "@/lib/storage";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const mimeType = searchParams.get("mimeType");

    const where: any = {};
    if (mimeType) where.mimeType = { startsWith: mimeType };
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { filename: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === Role.READER) {
      return NextResponse.json({ error: "Forbidden: Readers cannot upload media" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const alt = (formData.get("alt") as string) || null;
    const caption = (formData.get("caption") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = await uploadFile(buffer, file.name, file.type);

    const mediaRecord = await db.media.create({
      data: {
        filename: upload.filename,
        originalName: upload.originalName,
        mimeType: upload.mimeType,
        size: upload.size,
        url: upload.url,
        storageKey: upload.storageKey,
        alt,
        caption,
        uploadedByUserId: user.id,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "MEDIA_UPLOAD",
      entity: "Media",
      entityId: mediaRecord.id,
      metadata: { filename: mediaRecord.filename, size: mediaRecord.size },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, item: mediaRecord }, { status: 201 });
  } catch (error: any) {
    console.error("[MEDIA UPLOAD ERROR]:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
