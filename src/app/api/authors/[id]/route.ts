import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorProfileSchema } from "@/lib/validations/author";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const author = await db.authorProfile.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        books: { where: { deletedAt: null }, orderBy: { publicationDate: "desc" } },
        contentItems: {
          where: { status: "PUBLISHED", deletedAt: null },
          orderBy: { publishedAt: "desc" },
          include: { category: true, tags: { include: { tag: true } } },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json({ author });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch author" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.authorProfile.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Author profile not found" }, { status: 404 });
    }

    // Role check: Author can ONLY edit their own profile! SUPER_ADMIN can edit any.
    if (user.role !== Role.SUPER_ADMIN && user.authorProfileId !== existing.id) {
      return NextResponse.json({ error: "Forbidden: You cannot modify this author profile" }, { status: 403 });
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

    const updated = await db.authorProfile.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        photo: data.photo,
        location: data.location,
        website: data.website,
        twitter: data.twitter,
        instagram: data.instagram,
        linkedin: data.linkedin,
        goodreads: data.goodreads,
        genres: data.genres,
        isFeatured: user.role === Role.SUPER_ADMIN ? data.isFeatured : existing.isFeatured,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "AUTHOR_PROFILE_UPDATE",
      entity: "AuthorProfile",
      entityId: updated.id,
      metadata: { name: updated.name },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, author: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: SUPER_ADMIN only" }, { status: 403 });
    }

    await db.authorProfile.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "AUTHOR_PROFILE_DELETE",
      entity: "AuthorProfile",
      entityId: params.id,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Author deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete author" }, { status: 500 });
  }
}
