import { slugify } from "./utils";
import { db } from "./db";

export async function generateUniqueContentSlug(title: string, currentId?: string): Promise<string> {
  const base = slugify(title) || "untitled";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.contentItem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function generateUniqueBookSlug(title: string, currentId?: string): Promise<string> {
  const base = slugify(title) || "untitled-book";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function generateUniqueAuthorSlug(name: string, currentId?: string): Promise<string> {
  const base = slugify(name) || "author";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.authorProfile.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter++;
  }
}
