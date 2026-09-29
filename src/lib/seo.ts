import { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HIUHU";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DEFAULT_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE ||
  "A Literary Sanctuary for Discerning Authors, Readers, and Publishers";

export function constructMetadata({
  title,
  description = DEFAULT_TAGLINE,
  image = "/og-image.png",
  canonicalUrl,
  type = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  type?: "website" | "article" | "profile" | "book";
} = {}): Metadata {
  const metaTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${DEFAULT_TAGLINE}`;
  const canonical = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : SITE_URL;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: metaTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      type: type as any,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [fullImage],
      creator: "@HIUHUpress",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateAuthorSchema(author: {
  name: string;
  bio?: string | null;
  photo?: string | null;
  slug: string;
  website?: string | null;
  location?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio || undefined,
    image: author.photo ? (author.photo.startsWith("http") ? author.photo : `${SITE_URL}${author.photo}`) : undefined,
    url: `${SITE_URL}/authors/${author.slug}`,
    sameAs: [author.website].filter(Boolean),
    address: author.location
      ? {
          "@type": "PostalAddress",
          addressLocality: author.location,
        }
      : undefined,
  };
}

export function generateArticleSchema(article: {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  slug: string;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  author: { name: string; slug: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.coverImage ? (article.coverImage.startsWith("http") ? article.coverImage : `${SITE_URL}${article.coverImage}`) : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString() || article.publishedAt?.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `${SITE_URL}/authors/${article.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateBookSchema(book: {
  title: string;
  description: string;
  cover?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publicationDate?: Date | null;
  author: { name: string; slug: string };
  genre?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    isbn: book.isbn || undefined,
    publisher: book.publisher
      ? {
          "@type": "Organization",
          name: book.publisher,
        }
      : undefined,
    datePublished: book.publicationDate?.toISOString(),
    image: book.cover ? (book.cover.startsWith("http") ? book.cover : `${SITE_URL}${book.cover}`) : undefined,
    genre: book.genre || undefined,
    author: {
      "@type": "Person",
      name: book.author.name,
      url: `${SITE_URL}/authors/${book.author.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
