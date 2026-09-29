import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: "LOGOUT",
        entity: "User",
        entityId: user.id,
        ipAddress: req.ip || req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
