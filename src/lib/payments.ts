import Stripe from "stripe";

const globalForStripe = globalThis as typeof globalThis & {
  stripeClient?: Stripe;
};

type PayPalCheckoutOrderInput = {
  amount: number;
  orderIds: string[];
  locale: string;
};

type PayPalLink = {
  href: string;
  rel: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
};

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  if (!globalForStripe.stripeClient) {
    globalForStripe.stripeClient = new Stripe(secretKey);
  }

  return globalForStripe.stripeClient;
}

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? null;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

function getPayPalApiBaseUrl() {
  return process.env.PAYPAL_API_BASE_URL?.replace(/\/$/, "") || "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal.");
  }

  const payload = (await response.json()) as { access_token?: string };
  return payload.access_token ?? null;
}

export async function createPayPalCheckoutOrder({ amount, orderIds, locale }: PayPalCheckoutOrderInput) {
  const accessToken = await getPayPalAccessToken();
  const appUrl = getAppUrl();

  if (!accessToken || !appUrl) {
    return null;
  }

  const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "magneticict-order-bundle",
          custom_id: orderIds.join(","),
          description: "MagneticICT premium services",
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2)
          }
        }
      ],
      payment_source: {
        paypal: {
          experience_context: {
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: `${appUrl}/${locale}/checkout/success?provider=paypal&order_refs=${orderIds.join(",")}`,
            cancel_url: `${appUrl}/${locale}/checkout/cancel?provider=paypal&order_refs=${orderIds.join(",")}`
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error("Unable to create a PayPal order.");
  }

  const payload = (await response.json()) as PayPalOrderResponse;
  const approveUrl = payload.links?.find((link) => link.rel === "payer-action")?.href ?? null;

  return approveUrl
    ? {
        id: payload.id,
        approveUrl
      }
    : null;
}

export async function capturePayPalCheckoutOrder(orderToken: string) {
  const accessToken = await getPayPalAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderToken}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to capture the PayPal order.");
  }

  const payload = (await response.json()) as PayPalOrderResponse;
  const captureId = payload.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? payload.id;

  return {
    id: captureId,
    status: payload.status
  };
}
