import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createDomainCheckoutOrders } from "@/lib/domain-orders";
import { searchDomains } from "@/lib/domain-search";
import { getDomainProviderSettings, getEnabledPaymentMethodIds, getPaymentIntegrationsSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  items: z.array(z.object({
    domain: z.string().min(3),
    years: z.number().min(1).max(10),
    privacyProtection: z.boolean()
  })).min(1),
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
    const paymentSettings = await getPaymentIntegrationsSettings();

    if (!settings.enabled) {
      return NextResponse.json({ error: "Domain purchases are currently disabled." }, { status: 400 });
    }

    const enabledPaymentMethods = getEnabledPaymentMethodIds(paymentSettings);

    if (!enabledPaymentMethods[settings.checkoutProvider]) {
      return NextResponse.json({ error: "The configured domain checkout provider is currently disabled in platform settings." }, { status: 400 });
    }

    const domainItems = await Promise.all(
      parsed.data.items.map(async (item) => {
        const [result] = await searchDomains(item.domain);

        if (!result || result.status !== "available") {
          throw new Error(`${item.domain} is already taken or unavailable right now.`);
        }

        return {
          domain: result.domain,
          years: item.years,
          privacyProtection: item.privacyProtection,
          unitPrice: result.price
        };
      })
    );

    const checkout = await createDomainCheckoutOrders({
      userId: session.user.id,
      customerEmail: session.user.email,
      customerName: session.user.name ?? null,
      items: domainItems,
      paymentMethod: settings.checkoutProvider,
      locale: parsed.data.locale
    });

    return NextResponse.json({ ok: true, orderIds: checkout.orderIds, redirectUrl: checkout.redirectUrl });
  } catch (error) {
    console.error("Domain checkout creation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create the domain checkout right now." }, { status: 500 });
  }
}
