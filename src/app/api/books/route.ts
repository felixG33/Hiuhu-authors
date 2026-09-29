import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { bookSchema } from "@/lib/validations/book";
import { generateUniqueBookSlug } from "@/lib/slug";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";
import { canEditContent } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get("authorId");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");

    const where: any = {
      deletedAt: null,
    };

    if (authorId) where.authorId = authorId;
    if (genre) where.genre = genre;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const books = await db.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, slug: true, photo: true },
        },
      },
    });

    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === Role.READER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = bookSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;
    if (user.role === Role.AUTHOR) {
      if (!user.authorProfileId) {
        return NextResponse.json({ error: "No author profile associated" }, { status: 400 });
      }
      data.authorId = user.authorProfileId;
    }

    const slug = await generateUniqueBookSlug(data.slug || data.title);

    const book = await db.book.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        cover: data.cover,
        isbn: data.isbn,
        publisher: data.publisher,
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
        genre: data.genre,
        pages: data.pages,
        buyUrl: data.buyUrl,
        readUrl: data.readUrl,
        isFeatured: data.isFeatured,
        authorId: data.authorId,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "BOOK_CREATE",
      entity: "Book",
      entityId: book.id,
      metadata: { title: book.title },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create book" }, { status: 500 });
  }
}
