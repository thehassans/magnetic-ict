import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  channel: z.enum(["WHATSAPP", "MESSENGER", "INSTAGRAM"]),
  to: z.string().min(1),
  token: z.string().min(1),
  phoneNumberId: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { channel, to, token, phoneNumberId } = parsed.data;

  try {
    const url =
      channel === "WHATSAPP"
        ? `https://graph.facebook.com/v22.0/${phoneNumberId ?? ""}/messages`
        : "https://graph.facebook.com/v22.0/me/messages";

    const body =
      channel === "WHATSAPP"
        ? {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { body: "✅ Magnetic Chat — WhatsApp API test message." }
          }
        : {
            recipient: { id: to },
            messaging_type: "RESPONSE",
            message: { text: "✅ Magnetic Chat — Messenger/Instagram API test message." }
          };

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string }; messages?: unknown[] };

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message ?? "Meta API returned an error." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: `Test message sent to ${to} via ${channel}.` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error." }, { status: 500 });
  }
}
