import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createPendingOrders, markOrdersFailed, setPaymentReferenceForOrders } from "@/lib/order-processing";
import { createPayPalOrderForGooglePay, isPayPalConfigured } from "@/lib/payments";
import { getEnabledPaymentMethodIds, getPaymentIntegrationsSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  locale: z.string().min(2),
  items: z
    .array(
      z.object({
        serviceId: z.string(),
        tierId: z.string(),
        price: z.number().nonnegative(),
        hostingConfiguration: z
          .object({
            type: z.literal("hosting_vps"),
            operatingSystemId: z.string().default(""),
            controlPanelId: z.string().default("none"),
            addonIds: z.array(z.string()).default([]),
            locationId: z.string().default(""),
            domainMode: z.enum(["none", "register"]).default("none"),
            domainName: z.string().default(""),
            domainYears: z.number().int().min(1).max(10).default(1),
            domainPrivacyProtection: z.boolean().default(true),
            domainUnitPrice: z.number().nonnegative().default(0)
          })
          .optional(),
        hostingSummary: z.array(z.string()).optional()
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid checkout data." }, { status: 400 });
    }

    const allowedMethods = getEnabledPaymentMethodIds(await getPaymentIntegrationsSettings());

    if (!allowedMethods.GOOGLE_PAY) {
      return NextResponse.json({ error: "Google Pay is currently disabled." }, { status: 400 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
    }

    const orders = await createPendingOrders({
      userId: session.user.id,
      paymentMethod: "GOOGLE_PAY",
      items: parsed.data.items
    }) as Array<{ id: string; amount: number }>;

    const orderIds = orders.map((o) => o.id);
    const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);

    try {
      const paypalOrderId = await createPayPalOrderForGooglePay({ amount: totalAmount, orderIds });

      if (!paypalOrderId) {
        await markOrdersFailed(orderIds);
        return NextResponse.json({ error: "Could not create PayPal order for Google Pay." }, { status: 503 });
      }

      await setPaymentReferenceForOrders(orderIds, paypalOrderId);

      return NextResponse.json({ ok: true, paypalOrderId, orderIds, totalAmount: totalAmount.toFixed(2) });
    } catch (error) {
      await markOrdersFailed(orderIds);
      throw error;
    }
  } catch (error) {
    console.error("Google Pay order creation failed", error);
    return NextResponse.json({ error: "Unable to create your order right now." }, { status: 500 });
  }
}
