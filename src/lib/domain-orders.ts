import { createPayPalCheckoutOrder, getAppUrl, getStripeClient, isPayPalConfigured } from "@/lib/payments";
import { createDomainInvoiceNumber, createDomainOrderId, getDomainOrderById, getDomainOrderByPaymentReference, type DomainOrderRecord, upsertDomainOrder } from "@/lib/domain-db";
import { registerDomainOrderIfNeeded } from "@/lib/domain-provider";
import type { DomainPaymentMethod } from "@/lib/domain-types";

function createTimestamp() {
  return new Date().toISOString();
}

export function calculateDomainAmount({ price, years }: { price: number; years: number }) {
  return Number((price * years).toFixed(2));
}

export async function createDomainCheckoutOrder(args: {
  userId: string;
  customerEmail: string;
  customerName: string | null;
  domain: string;
  years: number;
  privacyProtection: boolean;
  unitPrice: number;
  paymentMethod: DomainPaymentMethod;
  locale: string;
}) {
  const now = createTimestamp();
  const record: DomainOrderRecord = {
    _id: createDomainOrderId(),
    userId: args.userId,
    customerEmail: args.customerEmail,
    customerName: args.customerName,
    domain: args.domain,
    years: args.years,
    privacyProtection: args.privacyProtection,
    amount: calculateDomainAmount({ price: args.unitPrice, years: args.years }),
    currency: "USD",
    paymentMethod: args.paymentMethod,
    paymentReference: null,
    status: "pending",
    errorMessage: null,
    registrarReference: null,
    invoiceNumber: createDomainInvoiceNumber(createDomainOrderId()),
    createdAt: now,
    updatedAt: now,
    paidAt: null,
    registeredAt: null,
    cancelledAt: null
  };

  await upsertDomainOrder(record);

  if (args.paymentMethod === "PAYPAL") {
    if (!isPayPalConfigured()) {
      record.status = "failed";
      record.updatedAt = createTimestamp();
      record.errorMessage = "PayPal is not configured yet.";
      await upsertDomainOrder(record);
      throw new Error(record.errorMessage);
    }

    const paypalOrder = await createPayPalCheckoutOrder({
      amount: record.amount,
      orderIds: [record._id],
      locale: args.locale,
      successPath: "/domains/checkout/success",
      cancelPath: "/domains/checkout/cancel"
    });

    if (!paypalOrder) {
      record.status = "failed";
      record.updatedAt = createTimestamp();
      record.errorMessage = "Unable to create a PayPal order for this domain.";
      await upsertDomainOrder(record);
      throw new Error(record.errorMessage);
    }

    record.paymentReference = paypalOrder.id;
    record.updatedAt = createTimestamp();
    await upsertDomainOrder(record);

    return { orderId: record._id, redirectUrl: paypalOrder.approveUrl };
  }

  const stripe = getStripeClient();
  const appUrl = getAppUrl();

  if (!stripe || !appUrl) {
    record.status = "failed";
    record.updatedAt = createTimestamp();
    record.errorMessage = "Stripe is not configured yet.";
    await upsertDomainOrder(record);
    throw new Error(record.errorMessage);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/${args.locale}/domains/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${args.locale}/domains/checkout/cancel?order_refs=${record._id}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(record.amount * 100),
          product_data: {
            name: `Domain Registration — ${record.domain}`
          }
        }
      }
    ],
    metadata: {
      checkoutType: "domain",
      domainOrderIds: record._id,
      domainName: record.domain
    }
  });

  record.paymentReference = session.id;
  record.updatedAt = createTimestamp();
  await upsertDomainOrder(record);

  return { orderId: record._id, redirectUrl: session.url };
}

export async function markDomainOrdersPaid(orderIds: string[], paymentReference: string) {
  for (const orderId of orderIds) {
    const record = await getDomainOrderById(orderId);

    if (!record) {
      continue;
    }

    record.status = "paid";
    record.paymentReference = paymentReference;
    record.paidAt = createTimestamp();
    record.updatedAt = record.paidAt;
    record.errorMessage = null;
    await upsertDomainOrder(record);
    await registerDomainOrderIfNeeded(record);
  }
}

export async function markDomainOrdersCancelled(orderIds: string[]) {
  for (const orderId of orderIds) {
    const record = await getDomainOrderById(orderId);

    if (!record) {
      continue;
    }

    record.status = "cancelled";
    record.cancelledAt = createTimestamp();
    record.updatedAt = record.cancelledAt;
    await upsertDomainOrder(record);
  }
}

export async function markDomainOrdersFailed(orderIds: string[], errorMessage = "Unable to complete this domain order.") {
  for (const orderId of orderIds) {
    const record = await getDomainOrderById(orderId);

    if (!record) {
      continue;
    }

    record.status = "failed";
    record.errorMessage = errorMessage;
    record.updatedAt = createTimestamp();
    await upsertDomainOrder(record);
  }
}

export async function getDomainOrdersByPaymentReference(paymentReference: string) {
  return getDomainOrderByPaymentReference(paymentReference);
}
