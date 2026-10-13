import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { contentSchema } from "@/lib/validations/content";
import { bookSchema } from "@/lib/validations/book";
import { authorProfileSchema } from "@/lib/validations/author";
import { commentSchema, contactSchema } from "@/lib/validations/contact";

describe("Zod Validation Schemas", () => {
  describe("Authentication Schemas", () => {
    it("should validate correct login credentials and reject invalid emails", () => {
      const valid = loginSchema.safeParse({
        email: "reader@hiuhu.org",
        password: "ValidPassword123!",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = loginSchema.safeParse({
        email: "not-an-email",
        password: "ValidPassword123!",
      });
      expect(invalidEmail.success).toBe(false);

      const shortPassword = loginSchema.safeParse({
        email: "reader@hiuhu.org",
        password: "123",
      });
      expect(shortPassword.success).toBe(false);
    });

    it("should validate registration data and enforce password matching", () => {
      const valid = registerSchema.safeParse({
        name: "Elena Vance",
        email: "elena@hiuhu.org",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(valid.success).toBe(true);

      const mismatched = registerSchema.safeParse({
        name: "Elena Vance",
        email: "elena@hiuhu.org",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      });
      expect(mismatched.success).toBe(false);
    });
  });

  describe("Content & Editorial Schemas", () => {
    it("should validate content item payload for articles, poems, and stories", () => {
      const validArticle = contentSchema.safeParse({
        title: "On the Margins of Language",
        slug: "on-the-margins-of-language",
        type: "ARTICLE",
        content: "Profound philosophical reflections on syntax and modern existential inquiry...",
        excerpt: "An essay exploring syntax and emptiness.",
        authorId: "auth_123",
        status: "PUBLISHED",
      });
      expect(validArticle.success).toBe(true);

      const missingTitle = contentSchema.safeParse({
        slug: "no-title",
        type: "POEM",
        content: "Stanzas here",
        authorId: "auth_123",
      });
      expect(missingTitle.success).toBe(false);
    });
  });

  describe("Book Catalog Schemas", () => {
    it("should validate book entries and optional purchase links", () => {
      const validBook = bookSchema.safeParse({
        title: "The Architecture of Silence",
        slug: "the-architecture-of-silence",
        authorId: "auth_123",
        description: "A profound collection exploring architectural spaces and interior solitude.",
        pageCount: 320,
        isbn: "978-0-123456-78-9",
      });
      expect(validBook.success).toBe(true);

      const invalidBook = bookSchema.safeParse({
        title: "",
        slug: "",
      });
      expect(invalidBook.success).toBe(false);
    });
  });

  describe("Author Profile Schemas", () => {
    it("should validate author profile attributes", () => {
      const validAuthor = authorProfileSchema.safeParse({
        name: "Marcus Thorne",
        slug: "marcus-thorne",
        bio: "Poet laureate and essayist residing in Cambridge.",
        location: "Cambridge, UK",
        isFeatured: true,
      });
      expect(validAuthor.success).toBe(true);
    });
  });

  describe("Comment and Contact Schemas", () => {
    it("should validate reader discourse comments and require minimum lengths", () => {
      const validComment = commentSchema.safeParse({
        contentItemId: "item_123",
        content: "A remarkably evocative passage that echoes early Rilke.",
        authorName: "Clarissa Dalloway",
      });
      expect(validComment.success).toBe(true);

      const emptyComment = commentSchema.safeParse({
        contentItemId: "item_123",
        content: "   ",
      });
      expect(emptyComment.success).toBe(false);
    });

    it("should validate contact form submissions", () => {
      const validContact = contactSchema.safeParse({
        name: "Literary Agent",
        email: "agent@agency.com",
        subject: "Manuscript Inquiry",
        message: "We would like to discuss syndication rights for Elena Vance's recent essays.",
      });
      expect(validContact.success).toBe(true);
    });
  });
});
