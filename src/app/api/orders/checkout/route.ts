import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createPendingOrders,
  markOrdersFailed,
  setPaymentReferenceForOrders,
  type CheckoutPaymentMethod
} from "@/lib/order-processing";
import {
  createPayPalCheckoutOrder,
  getAppUrl,
  getStripeClient,
  isPayPalConfigured
} from "@/lib/payments";
import { getEnabledPaymentMethodIds, getPaymentIntegrationsSettings } from "@/lib/platform-settings";

const paymentMethodSchema = z.enum(["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"]);

const checkoutSchema = z.object({
  paymentMethod: paymentMethodSchema,
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
            controlPanelId: z.string(),
            addonIds: z.array(z.string()),
            locationId: z.string()
          })
          .optional(),
        hostingSummary: z.array(z.string()).optional()
      })
    )
    .min(1)
});

type CheckoutPayload = z.infer<typeof checkoutSchema>;
type CreatedOrder = {
  id: string;
  amount: number;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid checkout data." }, { status: 400 });
    }

    const payload: CheckoutPayload = parsed.data;
    const allowedMethods = getEnabledPaymentMethodIds(await getPaymentIntegrationsSettings());

    if (!allowedMethods[payload.paymentMethod]) {
      return NextResponse.json(
        { error: "That payment method is currently disabled by platform settings." },
        { status: 400 }
      );
    }

    const orders = (await createPendingOrders({
      userId: session.user.id,
      paymentMethod: payload.paymentMethod as CheckoutPaymentMethod,
      items: payload.items
    })) as CreatedOrder[];

    const orderIds = orders.map((order: CreatedOrder) => order.id);

    if (payload.paymentMethod === "PAYPAL") {
      if (!isPayPalConfigured()) {
        await markOrdersFailed(orderIds);
        return NextResponse.json(
          { error: "PayPal is not configured yet. Add PayPal credentials to enable this provider." },
          { status: 503 }
        );
      }

      try {
        const totalAmount = orders.reduce(
          (sum: number, order: CreatedOrder) => sum + order.amount,
          0
        );

        const paypalOrder = await createPayPalCheckoutOrder({
          amount: totalAmount,
          orderIds,
          locale: payload.locale
        });

        if (!paypalOrder) {
          await markOrdersFailed(orderIds);
          return NextResponse.json(
            { error: "PayPal is configured, but an approval URL could not be created." },
            { status: 503 }
          );
        }

        await setPaymentReferenceForOrders(orderIds, paypalOrder.id);

        return NextResponse.json({
          ok: true,
          orderCount: orders.length,
          orderIds,
          redirectUrl: paypalOrder.approveUrl
        });
      } catch (error) {
        await markOrdersFailed(orderIds);
        throw error;
      }
    }

    const stripe = getStripeClient();
    const appUrl = getAppUrl();

    if (!stripe || !appUrl) {
      await markOrdersFailed(orderIds);
      return NextResponse.json(
        { error: "Stripe is not configured yet. Add Stripe keys and app URL to continue." },
        { status: 503 }
      );
    }

    try {
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${appUrl}/${payload.locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/${payload.locale}/checkout/cancel?order_refs=${orderIds.join(",")}`,
        line_items: orders.map((order: CreatedOrder) => ({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(order.amount * 100),
            product_data: {
              name: `${order.serviceNameSnapshot} — ${order.tierNameSnapshot}`
            }
          }
        })),
        metadata: {
          orderIds: orderIds.join(","),
          paymentMethod: payload.paymentMethod
        }
      });

      await setPaymentReferenceForOrders(orderIds, stripeSession.id);

      return NextResponse.json({
        ok: true,
        orderCount: orders.length,
        orderIds,
        redirectUrl: stripeSession.url
      });
    } catch (error) {
      await markOrdersFailed(orderIds);
      throw error;
    }
  } catch (error) {
    console.error("Checkout order creation failed", error);

    return NextResponse.json(
      { error: "Unable to create your order right now." },
      { status: 500 }
    );
  }
}
