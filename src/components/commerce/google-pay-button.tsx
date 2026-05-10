"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

type CartItem = {
  serviceId: string;
  tierId: string;
  price: number;
  hostingConfiguration?: unknown;
  hostingSummary?: string[];
};

type GooglePayButtonProps = {
  total: number;
  items: CartItem[];
  disabled?: boolean;
  onError?: (message: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
};

type GPayPaymentData = {
  paymentMethodData: {
    type: string;
    tokenizationData: { token: string; type: string };
  };
};

type GPayIsReadyToPayRequest = {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: GPayPaymentMethodSpec[];
};

type GPayPaymentMethodSpec = {
  type: string;
  parameters?: Record<string, unknown>;
  tokenizationSpecification?: Record<string, unknown>;
};

type GPayMerchantInfo = {
  merchantId?: string;
  merchantName?: string;
};

type GPayTransactionInfo = {
  countryCode: string;
  currencyCode: string;
  totalPriceStatus: "FINAL" | "ESTIMATED" | "NOT_CURRENTLY_KNOWN";
  totalPrice: string;
  totalPriceLabel?: string;
};

type GPayPaymentDataRequest = {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: GPayPaymentMethodSpec[];
  merchantInfo: GPayMerchantInfo;
  transactionInfo: GPayTransactionInfo;
};

type GPayClient = {
  isReadyToPay: (req: GPayIsReadyToPayRequest) => Promise<{ result: boolean }>;
  loadPaymentData: (req: GPayPaymentDataRequest) => Promise<GPayPaymentData>;
};

type GooglePayConfig = {
  allowedPaymentMethods: GPayPaymentMethodSpec[];
  apiVersion: number;
  apiVersionMinor: number;
  countryCode: string;
  merchantInfo: GPayMerchantInfo;
};

declare global {
  interface Window {
    paypal?: {
      Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (params: { orderId: string; approveGooglePayPayment: GPayPaymentData }) => Promise<{ status: string }>;
      };
    };
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: { environment: "TEST" | "PRODUCTION" }) => GPayClient;
        };
      };
    };
  }
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function GooglePayButton({ total, items, disabled, onError, onStart, onEnd }: GooglePayButtonProps) {
  const locale = useLocale();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isLive = process.env.NEXT_PUBLIC_PAYPAL_ENV === "live";

  useEffect(() => {
    if (!paypalClientId) return;

    const paypalSrc = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&components=googlepay`;

    Promise.all([
      loadScript("https://pay.google.com/gp/p/js/pay.js", "google-pay-sdk"),
      loadScript(paypalSrc, "paypal-googlepay-sdk")
    ])
      .then(() => setReady(true))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load payment scripts";
        onError?.(message);
      });
  }, [paypalClientId, onError]);

  async function handleGooglePay() {
    if (!window.paypal?.Googlepay || !window.google?.payments?.api?.PaymentsClient) {
      onError?.("Google Pay is not available. Please try another payment method.");
      return;
    }

    setLoading(true);
    onStart?.();

    try {
      const googlepay = window.paypal.Googlepay();
      const { allowedPaymentMethods, apiVersion, apiVersionMinor, countryCode, merchantInfo } = await googlepay.config();

      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: isLive ? "PRODUCTION" : "TEST"
      });

      const isReadyResponse = await paymentsClient.isReadyToPay({
        apiVersion,
        apiVersionMinor,
        allowedPaymentMethods
      } as GPayIsReadyToPayRequest);

      if (!isReadyResponse.result) {
        onError?.("Google Pay is not available on this device or browser.");
        setLoading(false);
        onEnd?.();
        return;
      }

      const createResponse = await fetch("/api/orders/googlepay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, items })
      });

      const createPayload = (await createResponse.json().catch(() => ({}))) as {
        ok?: boolean;
        paypalOrderId?: string;
        orderIds?: string[];
        totalAmount?: string;
        error?: string;
      };

      if (!createResponse.ok || !createPayload.paypalOrderId) {
        onError?.(createPayload.error ?? "Unable to create order. Please try again.");
        setLoading(false);
        onEnd?.();
        return;
      }

      const { paypalOrderId, orderIds, totalAmount } = createPayload;

      const paymentDataRequest: GPayPaymentDataRequest = {
        apiVersion,
        apiVersionMinor,
        allowedPaymentMethods,
        merchantInfo,
        transactionInfo: {
          countryCode,
          currencyCode: "USD",
          totalPriceStatus: "FINAL",
          totalPrice: totalAmount ?? total.toFixed(2),
          totalPriceLabel: "Total"
        }
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      const confirmResult = await googlepay.confirmOrder({
        orderId: paypalOrderId!,
        approveGooglePayPayment: paymentData
      });

      if (confirmResult.status !== "APPROVED") {
        onError?.("Google Pay payment was not approved. Please try again.");
        setLoading(false);
        onEnd?.();
        return;
      }

      const captureResponse = await fetch("/api/orders/googlepay/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId, orderIds })
      });

      const capturePayload = (await captureResponse.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!captureResponse.ok || !capturePayload.ok) {
        onError?.(capturePayload.error ?? "Payment capture failed. Please contact support.");
        setLoading(false);
        onEnd?.();
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes("User closed")) {
        // User dismissed Google Pay sheet — not an error
      } else {
        onError?.("Google Pay payment failed. Please try again or use another method.");
      }
      setLoading(false);
      onEnd?.();
    }
  }

  if (!paypalClientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
        Google Pay requires <code className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to be set.
      </div>
    );
  }

  return (
    <div ref={buttonRef} className="mt-5">
      <button
        type="button"
        onClick={() => void handleGooglePay()}
        disabled={disabled || !ready || loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-black text-[13px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <svg viewBox="0 0 48 24" className="h-5 w-auto" aria-hidden>
              <text x="0" y="19" fontFamily="Product Sans, sans-serif" fontSize="22" fill="#4285F4">G</text>
              <text x="14" y="19" fontFamily="Product Sans, sans-serif" fontSize="22" fill="#34A853">o</text>
              <text x="25" y="19" fontFamily="Product Sans, sans-serif" fontSize="22" fill="#FBBC04">o</text>
              <text x="36" y="19" fontFamily="Product Sans, sans-serif" fontSize="22" fill="#EA4335">g</text>
            </svg>
            <span className="text-white/90">Pay</span>
          </>
        )}
      </button>
      {!ready && (
        <p className="mt-2 text-center text-[11px] text-slate-400">Loading Google Pay…</p>
      )}
    </div>
  );
}
