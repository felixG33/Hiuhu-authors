import { z } from "zod";
import { ContentType, ContentStatus } from "@prisma/client";

export const contentItemSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10, "Content must have at least 10 characters"),
  coverImage: z.string().url("Must be a valid URL").or(z.string().startsWith("/")).optional().nullable(),
  type: z.nativeEnum(ContentType),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  
  // SEO
  seoTitle: z.string().max(100).optional().nullable(),
  seoDescription: z.string().max(250).optional().nullable(),
  seoKeywords: z.string().max(200).optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type ContentItemInput = z.infer<typeof contentItemSchema>;
