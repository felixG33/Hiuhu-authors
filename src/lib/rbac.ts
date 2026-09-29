import { Role } from "@prisma/client";
import { getCurrentUser, SessionUser } from "./auth";

export function isSuperAdmin(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function isEditor(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN || user?.role === Role.EDITOR;
}

export function isAuthor(user?: SessionUser | null): boolean {
  return (
    user?.role === Role.SUPER_ADMIN ||
    user?.role === Role.EDITOR ||
    user?.role === Role.AUTHOR
  );
}

export function canAccessAdmin(user?: SessionUser | null): boolean {
  if (!user) return false;
  return (
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.EDITOR ||
    user.role === Role.AUTHOR
  );
}

export function canManageUsers(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function canManageSettings(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function canManageAuditLogs(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function canManageHomepage(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function canManageNavigation(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN;
}

export function canModerateComments(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN || user?.role === Role.EDITOR;
}

export function canManageTaxonomy(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN || user?.role === Role.EDITOR;
}

export function canPublishContent(user?: SessionUser | null): boolean {
  return user?.role === Role.SUPER_ADMIN || user?.role === Role.EDITOR;
}

/**
 * Enforces ownership: SUPER_ADMIN and EDITOR can edit any content.
 * An AUTHOR can ONLY edit their own content.
 * Readers cannot edit any content.
 */
export function canEditContent(user: SessionUser | null | undefined, authorProfileId?: string | null): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN || user.role === Role.EDITOR) return true;
  if (user.role === Role.AUTHOR && authorProfileId && user.authorProfileId === authorProfileId) {
    return true;
  }
  return false;
}

export function canDeleteContent(user: SessionUser | null | undefined, authorProfileId?: string | null): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.EDITOR) return true;
  if (user.role === Role.AUTHOR && authorProfileId && user.authorProfileId === authorProfileId) {
    return true;
  }
  return false;
}

/**
 * Server guard: asserts that user is logged in, throws error if not
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Server guard: asserts that user has one of the allowed roles
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(", ")}]`);
  }
  return user;
}
