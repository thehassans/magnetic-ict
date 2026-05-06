import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendTicketClosedEmail, sendTicketReplyEmail } from "@/lib/email";
import { addSupportTicketReply, closeSupportTicket, getSupportTicketById, reopenSupportTicket } from "@/lib/support-tickets";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reply"),
    message: z.string().min(1).max(4000)
  }),
  z.object({
    action: z.literal("close")
  }),
  z.object({
    action: z.literal("reopen")
  })
]);

async function requireAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session, response: null as NextResponse<unknown> | null };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { session, response } = await requireAdminSession();

  if (response || !session) {
    return response as NextResponse;
  }

  try {
    const [{ ticketId }, body] = await Promise.all([params, request.json()]);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid support ticket action." }, { status: 400 });
    }

    const currentTicket = await getSupportTicketById(ticketId);

    if (!currentTicket) {
      return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
    }

    if (parsed.data.action === "reply") {
      const updated = await addSupportTicketReply(ticketId, {
        authorType: "admin",
        authorName: session.user.name ?? "Admin",
        authorEmail: session.user.email ?? null,
        body: parsed.data.message
      });

      if (!updated) {
        return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
      }

      await sendTicketReplyEmail({
        email: updated.customerEmail,
        customerName: updated.customerName,
        ticketId: updated._id,
        subjectLine: updated.subject,
        repliedBy: session.user.name ?? "Admin",
        replyPreview: parsed.data.message.slice(0, 180)
      });

      return NextResponse.json({ ok: true, ticket: updated });
    }

    if (parsed.data.action === "close") {
      const updated = await closeSupportTicket(ticketId);

      if (!updated) {
        return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
      }

      await sendTicketClosedEmail({
        email: updated.customerEmail,
        customerName: updated.customerName,
        ticketId: updated._id,
        subjectLine: updated.subject
      });

      return NextResponse.json({ ok: true, ticket: updated });
    }

    const updated = await reopenSupportTicket(ticketId);

    if (!updated) {
      return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update the support ticket." },
      { status: 400 }
    );
  }
}
