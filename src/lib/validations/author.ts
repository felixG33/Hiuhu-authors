import { z } from "zod";

export const authorProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  bio: z.string().max(3000).optional().nullable(),
  photo: z.string().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  twitter: z.string().max(50).optional().nullable(),
  instagram: z.string().max(50).optional().nullable(),
  linkedin: z.string().max(100).optional().nullable(),
  goodreads: z.string().max(100).optional().nullable(),
  genres: z.string().max(200).optional().nullable(),
  isFeatured: z.boolean().default(false),
  userId: z.string().optional(),
});

export type AuthorProfileInput = z.infer<typeof authorProfileSchema>;
