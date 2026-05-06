import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { sendNewsletterSubscriptionEmail } from "@/lib/email";
import { subscribeToNewsletter } from "@/lib/newsletter-subscriptions";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const requestSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().default("")
});

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Newsletter subscriptions are not available right now." }, { status: 503 });
  }

  try {
    const [session, body] = await Promise.all([auth(), request.json()]);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const name = parsed.data.name.trim() || session?.user?.name || null;

    const subscription = await subscribeToNewsletter({
      email,
      name,
      userId: session?.user?.id ?? null,
      source: "footer"
    });

    await sendNewsletterSubscriptionEmail({
      email: subscription.email,
      customerName: subscription.name
    });

    return NextResponse.json({ ok: true, message: "You are subscribed to MagneticICT updates." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to subscribe right now." },
      { status: 400 }
    );
  }
}
