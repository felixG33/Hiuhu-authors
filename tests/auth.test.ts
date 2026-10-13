import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken, generateToken } from "@/lib/auth";
import { Role } from "@prisma/client";

describe("Authentication & Session Library", () => {
  it("should securely hash passwords and verify matching passwords", async () => {
    const raw = "SuperSecretPassword123!";
    const hashed = await hashPassword(raw);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(raw, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword!", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("should sign and verify valid Jose JWT session tokens", async () => {
    const mockUser = {
      id: "usr_12345",
      email: "author@hiuhu.org",
      name: "Marcus Thorne",
      role: Role.AUTHOR,
      authorProfileId: "prof_67890",
      authorSlug: "marcus-thorne",
    };

    const token = await signSessionToken(mockUser, "1h");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockUser.id);
    expect(decoded?.email).toBe(mockUser.email);
    expect(decoded?.name).toBe(mockUser.name);
    expect(decoded?.role).toBe(Role.AUTHOR);
    expect(decoded?.authorProfileId).toBe(mockUser.authorProfileId);
    expect(decoded?.authorSlug).toBe(mockUser.authorSlug);
  });

  it("should return null for tampered or invalid JWT tokens", async () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token";
    const decoded = await verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it("should generate random tokens of specified length", () => {
    const token32 = generateToken(32);
    expect(token32.length).toBe(32);

    const token64 = generateToken(64);
    expect(token64.length).toBe(64);
  });
});
