import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createDomainCheckoutOrder } from "@/lib/domain-orders";
import { getDomainProviderSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  domain: z.string().min(3),
  years: z.number().min(1).max(10),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"]),
  price: z.number().nonnegative(),
  privacyProtection: z.boolean(),
  locale: z.string().min(2)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid domain checkout data." }, { status: 400 });
    }

    const settings = await getDomainProviderSettings();

    if (!settings.enabled) {
      return NextResponse.json({ error: "Domain purchases are currently disabled." }, { status: 400 });
    }

    const checkout = await createDomainCheckoutOrder({
      userId: session.user.id,
      customerEmail: session.user.email,
      customerName: session.user.name ?? null,
      domain: parsed.data.domain,
      years: parsed.data.years,
      privacyProtection: parsed.data.privacyProtection,
      unitPrice: parsed.data.price,
      paymentMethod: parsed.data.paymentMethod,
      locale: parsed.data.locale
    });

    return NextResponse.json({ ok: true, orderId: checkout.orderId, redirectUrl: checkout.redirectUrl });
  } catch (error) {
    console.error("Domain checkout creation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create the domain checkout right now." }, { status: 500 });
  }
}
