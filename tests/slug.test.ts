import { describe, it, expect } from "vitest";
import { slugify, calculateReadingTime, truncateText, formatBytes } from "@/lib/utils";

describe("Utility Functions & Text Processing", () => {
  it("should generate clean SEO URL slugs", () => {
    expect(slugify("The Architecture of Silence")).toBe("the-architecture-of-silence");
    expect(slugify("Echoes in the Fog: A Study & Anthology!")).toBe("echoes-in-the-fog-a-study-anthology");
    expect(slugify("   Spaces  -- and __ underscores   ")).toBe("spaces-and-underscores");
    expect(slugify("HIUHU Publishing 2026")).toBe("hiuhu-publishing-2026");
  });

  it("should calculate reading time in minutes based on 200 words per minute", () => {
    // 100 words -> 1 minute minimum
    const shortText = Array(100).fill("word").join(" ");
    expect(calculateReadingTime(shortText)).toBe(1);

    // 400 words -> 2 minutes
    const mediumText = Array(400).fill("word").join(" ");
    expect(calculateReadingTime(mediumText)).toBe(2);

    // 1000 words -> 5 minutes
    const longText = Array(1000).fill("word").join(" ");
    expect(calculateReadingTime(longText)).toBe(5);
  });

  it("should truncate text cleanly with ellipsis", () => {
    const text = "The quick brown fox jumps over the lazy dog";
    expect(truncateText(text, 15)).toBe("The quick brown…");
    expect(truncateText("Short text", 50)).toBe("Short text");
  });

  it("should format bytes into human readable binary measurements", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(5242880)).toBe("5 MB");
  });
});
