import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorProfileSchema } from "@/lib/validations/author";
import { generateUniqueAuthorSlug } from "@/lib/slug";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("featured");

    const where: any = {};
    if (isFeatured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const authors = await db.authorProfile.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            contentItems: { where: { status: "PUBLISHED", deletedAt: null } },
            books: { where: { deletedAt: null } },
          },
        },
      },
    });

    return NextResponse.json({ authors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.AUTHOR)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = authorProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    const targetUserId = user.role === Role.SUPER_ADMIN && data.userId ? data.userId : user.id;

    // Check if user already has an author profile
    const existing = await db.authorProfile.findUnique({
      where: { userId: targetUserId },
    });

    if (existing) {
      return NextResponse.json({ error: "Author profile already exists for this user" }, { status: 409 });
    }

    const slug = await generateUniqueAuthorSlug(data.slug || data.name);

    const author = await db.authorProfile.create({
      data: {
        userId: targetUserId,
        name: data.name,
        slug,
        bio: data.bio,
        photo: data.photo,
        location: data.location,
        website: data.website,
        twitter: data.twitter,
        instagram: data.instagram,
        linkedin: data.linkedin,
        goodreads: data.goodreads,
        genres: data.genres,
        isFeatured: user.role === Role.SUPER_ADMIN ? data.isFeatured : false,
      },
    });

    // Automatically elevate user to AUTHOR role if not already SUPER_ADMIN
    if (user.role === Role.READER && targetUserId === user.id) {
      await db.user.update({
        where: { id: user.id },
        data: { role: Role.AUTHOR },
      });
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "AUTHOR_PROFILE_CREATE",
      entity: "AuthorProfile",
      entityId: author.id,
      metadata: { name: author.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, author }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create author profile" }, { status: 500 });
  }
}
