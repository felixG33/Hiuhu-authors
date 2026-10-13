import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validated.data;
    const ip = req.ip || req.headers.get("x-forwarded-for") || undefined;

    // Rate limiting check: max 5 messages per IP per hour
    if (ip) {
      const recent = await db.contactMessage.count({
        where: {
          ipAddress: ip,
          createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });
      if (recent >= 5) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    const record = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: ip,
      },
    });

    // Notify administrator
    const adminEmail = process.env.ADMIN_EMAIL || "admin@hiuhu.org";
    await sendEmail({
      to: adminEmail,
      subject: `[HIUHU Inquiries] ${subject}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; padding: 24px;">
          <h2>New Message Received via HIUHU Press</h2>
          <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been delivered to the HIUHU editorial team. We will review it shortly.",
      id: record.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
