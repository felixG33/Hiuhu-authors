import { describe, it, expect } from "vitest";
import {
  isSuperAdmin,
  isEditor,
  isAuthor,
  canAccessAdmin,
  canManageUsers,
  canManageSettings,
  canModerateComments,
  canEditContent,
  canDeleteContent,
} from "@/lib/rbac";
import { Role } from "@prisma/client";
import { SessionUser } from "@/lib/auth";

describe("Role-Based Access Control (RBAC) Hierarchy", () => {
  const superAdminUser: SessionUser = {
    id: "usr_admin",
    email: "admin@hiuhu.org",
    name: "HIUHU",
    role: Role.SUPER_ADMIN,
  };

  const editorUser: SessionUser = {
    id: "usr_editor",
    email: "editor@hiuhu.org",
    name: "Editor Chief",
    role: Role.EDITOR,
  };

  const authorUser1: SessionUser = {
    id: "usr_author1",
    email: "elena@hiuhu.org",
    name: "Elena Vance",
    role: Role.AUTHOR,
    authorProfileId: "prof_elena",
  };

  const authorUser2: SessionUser = {
    id: "usr_author2",
    email: "marcus@hiuhu.org",
    name: "Marcus Thorne",
    role: Role.AUTHOR,
    authorProfileId: "prof_marcus",
  };

  const readerUser: SessionUser = {
    id: "usr_reader",
    email: "reader@gmail.com",
    name: "Avid Reader",
    role: Role.READER,
  };

  it("should evaluate isSuperAdmin correctly", () => {
    expect(isSuperAdmin(superAdminUser)).toBe(true);
    expect(isSuperAdmin(editorUser)).toBe(false);
    expect(isSuperAdmin(authorUser1)).toBe(false);
    expect(isSuperAdmin(readerUser)).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });

  it("should evaluate isEditor for Super Admin and Editor", () => {
    expect(isEditor(superAdminUser)).toBe(true);
    expect(isEditor(editorUser)).toBe(true);
    expect(isEditor(authorUser1)).toBe(false);
    expect(isEditor(readerUser)).toBe(false);
  });

  it("should permit admin dashboard access only to admin, editor, and author", () => {
    expect(canAccessAdmin(superAdminUser)).toBe(true);
    expect(canAccessAdmin(editorUser)).toBe(true);
    expect(canAccessAdmin(authorUser1)).toBe(true);
    expect(canAccessAdmin(readerUser)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("should restrict user management and system settings to Super Admin only", () => {
    expect(canManageUsers(superAdminUser)).toBe(true);
    expect(canManageUsers(editorUser)).toBe(false);
    expect(canManageUsers(authorUser1)).toBe(false);

    expect(canManageSettings(superAdminUser)).toBe(true);
    expect(canManageSettings(editorUser)).toBe(false);
  });

  it("should allow Super Admin and Editor to moderate discourse comments", () => {
    expect(canModerateComments(superAdminUser)).toBe(true);
    expect(canModerateComments(editorUser)).toBe(true);
    expect(canModerateComments(authorUser1)).toBe(false);
    expect(canModerateComments(readerUser)).toBe(false);
  });

  it("should strictly enforce content ownership: authors can only edit/delete their own work", () => {
    // Super admin can edit anyone's work
    expect(canEditContent(superAdminUser, "prof_elena")).toBe(true);
    expect(canDeleteContent(superAdminUser, "prof_elena")).toBe(true);

    // Editor can edit anyone's work
    expect(canEditContent(editorUser, "prof_elena")).toBe(true);
    expect(canDeleteContent(editorUser, "prof_elena")).toBe(true);

    // Author 1 can edit Elena's work
    expect(canEditContent(authorUser1, "prof_elena")).toBe(true);
    expect(canDeleteContent(authorUser1, "prof_elena")).toBe(true);

    // Author 1 CANNOT edit Marcus's work!
    expect(canEditContent(authorUser1, "prof_marcus")).toBe(false);
    expect(canDeleteContent(authorUser1, "prof_marcus")).toBe(false);

    // Reader cannot edit any work
    expect(canEditContent(readerUser, "prof_elena")).toBe(false);
    expect(canDeleteContent(readerUser, "prof_elena")).toBe(false);
  });
});
