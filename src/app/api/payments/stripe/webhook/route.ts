import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getOrdersByPaymentReference,
  markOrdersFailed,
  markOrdersPaid
} from "@/lib/order-processing";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/payments";

type ReferencedOrder = {
  id: string;
};

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook verification failed", error);
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderIds = session.metadata?.orderIds?.split(",").filter(Boolean);

        if (orderIds && orderIds.length > 0 && session.id) {
          await markOrdersPaid(orderIds, session.id);
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orders = (session.id ? await getOrdersByPaymentReference(session.id) : []) as ReferencedOrder[];
        await markOrdersFailed(orders.map((order: ReferencedOrder) => order.id));
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
