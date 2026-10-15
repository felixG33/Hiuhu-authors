import { PrismaClient } from "@prisma/client";

// Neon PostgreSQL pooled connection with extended connect_timeout and pool_timeout for serverless cold starts
const DEFAULT_POOLED_URL =
  "postgresql://neondb_owner:npg_e4yt0NQKEACS@ep-sparkling-mode-b46htm9e-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30";

let dbUrl = process.env.DATABASE_URL || DEFAULT_POOLED_URL;

// Strip any invalid channel_binding parameter that breaks PgBouncer pooler
if (dbUrl.includes("channel_binding")) {
  dbUrl = dbUrl.replace(/[?&]channel_binding=[^&]+/g, "");
}

// Ensure pooler endpoint and timeout parameters are present
if (dbUrl.includes("neon.tech")) {
  if (!dbUrl.includes("-pooler")) {
    dbUrl = dbUrl.replace(".neon.tech", "-pooler.neon.tech");
  }
  if (!dbUrl.includes("connect_timeout")) {
    dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30";
  }
}

process.env.DATABASE_URL = dbUrl;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

/**
 * Execute a database query with automatic retry for serverless / Neon cold start wake-ups
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 800): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      console.warn(`[DB RETRY] Database query warming up, retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
      return withDbRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

export default db;
