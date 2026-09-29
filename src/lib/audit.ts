import { db } from "./db";

export interface AuditLogParams {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent({
  userId,
  userEmail,
  action,
  entity,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    // Audit logging should not crash the primary operation, but log to stderr
    console.error("[AUDIT LOG ERROR]:", error);
  }
}
