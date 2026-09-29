import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = validated.data;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // To prevent email enumeration, return 200 even if user not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been dispatched.",
      });
    }

    const resetToken = generateToken(48);
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "HIUHU Password Reset Request",
      html: getPasswordResetEmailHtml(user.name, resetUrl),
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
      ipAddress: req.ip || req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset link has been dispatched.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
