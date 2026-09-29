import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signSessionToken, generateToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { Role } from "@prisma/client";
import { logAuditEvent } from "@/lib/audit";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;
    const lowerEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateToken(48);

    const user = await db.user.create({
      data: {
        name,
        email: lowerEmail,
        passwordHash,
        role: Role.READER, // Reader by default; admins can promote to AUTHOR or EDITOR
        verificationToken,
      },
    });

    // Send verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Welcome to HIUHU — Confirm Your Email",
      html: getVerificationEmailHtml(user.name, verifyUrl),
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      user: sessionUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("[REGISTER ERROR]:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
