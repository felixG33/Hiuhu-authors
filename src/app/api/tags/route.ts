import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/taxonomy";
import { slugify } from "@/lib/utils";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = tagSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Validation failed", details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = validated.data;
    const slug = data.slug || slugify(data.name);

    const tag = await db.tag.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });

    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create tag" }, { status: 500 });
  }
}
