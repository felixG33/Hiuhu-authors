import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          emailVerified: true,
          authorProfile: {
            select: {
              id: true,
              slug: true,
              name: true,
              photo: true,
            },
          },
        },
      });
    } catch {
      // Database unavailable or cold
    }

    if (!user) {
      user = {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        avatar: null,
        emailVerified: new Date(),
        authorProfile: {
          id: session.authorProfileId || "hiuhu-author-root",
          slug: session.authorSlug || "hiuhu",
          name: session.name,
          photo: null,
        },
      };
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
