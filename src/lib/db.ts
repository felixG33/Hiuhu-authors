import { PrismaClient } from "@prisma/client";

const POOLED_DATABASE_URL =
  "postgresql://neondb_owner:npg_zMCs15eKYUaS@ep-sparkling-mode-b46htm9e-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=15";

// Ensure process.env.DATABASE_URL is always populated so Prisma runtime validation never fails
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = POOLED_DATABASE_URL;
} else if (
  process.env.DATABASE_URL.includes("neon.tech") &&
  !process.env.DATABASE_URL.includes("-pooler")
) {
  // Automatically switch to connection pooler endpoint on Neon to prevent serverless drops
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(".neon.tech", "-pooler.neon.tech");
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

export default db;
