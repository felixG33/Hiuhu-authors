import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { bookSchema } from "@/lib/validations/book";
import { logAuditEvent } from "@/lib/audit";
import { canEditContent, canDeleteContent } from "@/lib/rbac";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await db.book.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!book || book.deletedAt) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.book.findUnique({ where: { id: params.id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!canEditContent(user, existing.authorId)) {
      return NextResponse.json({ error: "Forbidden: You cannot edit another author's book" }, { status: 403 });
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

    const updated = await db.book.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
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
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "BOOK_UPDATE",
      entity: "Book",
      entityId: updated.id,
      metadata: { title: updated.title },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, book: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.book.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!canDeleteContent(user, existing.authorId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.book.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "BOOK_DELETE",
      entity: "Book",
      entityId: params.id,
      metadata: { title: existing.title },
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ success: true, message: "Book deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
