import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendMailgunTestEmail } from "@/lib/email";

export const runtime = "nodejs";

const requestSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.literal("mailgun").optional(),
  apiBaseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  domain: z.string().optional(),
  fromEmail: z.string().optional(),
  fromName: z.string().optional(),
  replyToEmail: z.string().optional(),
  testRecipient: z.string().optional(),
  recipient: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Provide a valid Mailgun test payload." }, { status: 400 });
    }

    await sendMailgunTestEmail(parsed.data);
    return NextResponse.json({ ok: true, message: "Mailgun test email sent successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send the Mailgun test email right now." },
      { status: 400 }
    );
  }
}
