import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendTicketCreatedEmail } from "@/lib/email";
import { createSupportTicket } from "@/lib/support-tickets";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const requestSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().default(""),
  subject: z.string().min(3).max(160),
  category: z.string().max(80).optional().default(""),
  message: z.string().min(10).max(4000)
});

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Support ticketing is not available right now." }, { status: 503 });
  }

  try {
    const [session, body] = await Promise.all([auth(), request.json()]);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please complete the support form before submitting." }, { status: 400 });
    }

    const email = parsed.data.email?.trim().toLowerCase() || session?.user?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "An email address is required so we can reply to your ticket." }, { status: 400 });
    }

    const name = parsed.data.name.trim() || session?.user?.name || null;
    const ticket = await createSupportTicket({
      userId: session?.user?.id ?? null,
      customerEmail: email,
      customerName: name,
      subject: parsed.data.subject,
      category: parsed.data.category,
      message: parsed.data.message
    });

    await sendTicketCreatedEmail({
      email: ticket.customerEmail,
      customerName: ticket.customerName,
      ticketId: ticket._id,
      subjectLine: ticket.subject,
      category: ticket.category
    });

    return NextResponse.json({ ok: true, ticketId: ticket._id, message: "Support ticket created successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create the support ticket." },
      { status: 400 }
    );
  }
}
