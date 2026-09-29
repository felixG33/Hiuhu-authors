import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

export const commentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters").max(1000),
  authorName: z.string().min(2, "Name must be at least 2 characters").max(60).optional(),
  authorEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  contentItemId: z.string().min(1, "Content ID is required"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
