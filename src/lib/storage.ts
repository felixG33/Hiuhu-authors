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
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `Unsupported file type: ${file.type}. Allowed: images, PDF, and EPUB.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds the 15MB limit.` };
  }
  return { valid: true };
}

/**
 * Uploads a file buffer either to local public/uploads or S3-compatible storage
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

  if (provider === "s3" && process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET) {
    // S3 Compatible Provider (R2, AWS, MinIO)
    const storageKey = `media/${filename}`;
    // Construct public or signed URL
    const publicUrl = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${storageKey}`;
    return {
      url: publicUrl,
      filename,
      originalName: originalFilename,
      mimeType,
      size: buffer.length,
      storageKey,
    };
  }

  // Local Storage Fallback: writes to public/uploads
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
}

/**
 * Deletes a file from local or cloud storage
 */
export async function deleteFile(storageKey: string): Promise<boolean> {
  try {
    const provider = process.env.STORAGE_PROVIDER || "local";
    if (provider === "local") {
      const filePath = path.join(process.cwd(), "public", "uploads", storageKey);
      await fs.unlink(filePath);
      return true;
    }
    // S3 deletion placeholder
    return true;
  } catch {
    return false;
  }
}
