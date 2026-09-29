import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cover: z.string().url("Must be a valid URL").or(z.string().startsWith("/")).optional().nullable(),
  isbn: z.string().max(30).optional().nullable(),
  publisher: z.string().max(100).optional().nullable(),
  publicationDate: z.string().optional().nullable(),
  genre: z.string().max(100).optional().nullable(),
  pages: z.number().int().positive().optional().nullable(),
  buyUrl: z.string().url().optional().nullable().or(z.literal("")),
  readUrl: z.string().url().optional().nullable().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  authorId: z.string().min(1, "Author is required"),
});

export type BookInput = z.infer<typeof bookSchema>;
