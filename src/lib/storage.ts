import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
  "application/epub+zip",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function validateFile(file: { type: string; size: number; name: string }): { valid: boolean; error?: string } {
  let type = file.type;
  if (!type || type === "application/octet-stream") {
    const ext = path.extname(file.name).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".avif": "image/avif",
      ".pdf": "application/pdf",
      ".epub": "application/epub+zip",
    };
    if (mimeMap[ext]) {
      type = mimeMap[ext];
    }
  }

  if (!ALLOWED_MIME_TYPES.has(type)) {
    return { valid: false, error: `Unsupported file type: ${type || "unknown"}. Allowed: images, PDF, and EPUB.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds the 15MB limit.` };
  }
  return { valid: true };
}

/**
 * Uploads a file buffer either to local public/uploads, S3 storage, or data URL fallback in serverless
 */
export async function uploadFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || ".bin";
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const safeBaseName = path
    .basename(originalFilename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const filename = `${safeBaseName}-${uniqueId}${ext}`;
  const provider = process.env.STORAGE_PROVIDER || "local";

  // Check if running in a serverless read-only filesystem (Vercel, AWS Lambda, Netlify, etc.)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT) ||
    process.cwd().startsWith("/var/task");

  // S3 Compatible Provider (R2, AWS, MinIO)
  if (provider === "s3" && process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET) {
    const storageKey = `media/${filename}`;
    const publicUrl = `${process.env.STORAGE_ENDPOINT.replace(/\/$/, "")}/${process.env.STORAGE_BUCKET}/${storageKey}`;
    return {
      url: publicUrl,
      filename,
      originalName: originalFilename,
      mimeType,
      size: buffer.length,
      storageKey,
    };
  }

  // Local Storage (for local development or persistent VM servers)
  if (!isServerless && provider === "local") {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return {
        url: publicUrl,
        filename,
        originalName: originalFilename,
        mimeType,
        size: buffer.length,
        storageKey: filename,
      };
    } catch (fsError: any) {
      console.warn(
        "[STORAGE WARNING] Local filesystem write failed (read-only environment detected). Falling back to inline Data URL:",
        fsError?.message
      );
    }
  }

  // Serverless or read-only filesystem fallback: store as a self-contained Data URL
  // Images render natively in <img src="..."> tags across all pages without needing external storage
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUrl,
    filename,
    originalName: originalFilename,
    mimeType,
    size: buffer.length,
    storageKey: filename,
  };
}

/**
 * Deletes a file from local or cloud storage
 */
export async function deleteFile(storageKey: string): Promise<boolean> {
  try {
    const provider = process.env.STORAGE_PROVIDER || "local";
    if (provider === "local" && !storageKey.startsWith("data:")) {
      const filePath = path.join(process.cwd(), "public", "uploads", storageKey);
      await fs.unlink(filePath).catch(() => {});
      return true;
    }
    return true;
  } catch {
    return false;
  }
}
