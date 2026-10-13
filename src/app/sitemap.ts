import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hiuhu.org";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/poems`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/stories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/authors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [books, contents, authors] = await Promise.all([
      db.book.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      db.contentItem.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { slug: true, type: true, updatedAt: true },
      }),
      db.authorProfile.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const bookRoutes: MetadataRoute.Sitemap = books.map((b) => ({
      url: `${baseUrl}/books/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const authorRoutes: MetadataRoute.Sitemap = authors.map((a) => ({
      url: `${baseUrl}/authors/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const contentRoutes: MetadataRoute.Sitemap = contents.map((c) => {
      let section = "articles";
      if (c.type === "POEM") section = "poems";
      if (c.type === "STORY") section = "stories";
      return {
        url: `${baseUrl}/${section}/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...bookRoutes, ...authorRoutes, ...contentRoutes];
  } catch (err) {
    console.error("[SITEMAP GENERATION ERROR]:", err);
    return staticRoutes;
  }
}
