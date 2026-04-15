import { Resend } from "resend";
import { getPlatformSettings } from "@/lib/platform-settings";

const resend = process.env.AUTH_RESEND_KEY ? new Resend(process.env.AUTH_RESEND_KEY) : null;

function assertEmailConfig() {
  if (!resend) {
    throw new Error("AUTH_RESEND_KEY is not configured.");
  }

  if (!process.env.AUTH_EMAIL_FROM) {
    throw new Error("AUTH_EMAIL_FROM is not configured.");
  }
}

function getCanonicalAppUrl() {
  return process.env.AUTH_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || null;
}

function resolveEmailHref(href: string) {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  const appUrl = getCanonicalAppUrl();

  if (!appUrl) {
    return href;
  }

  return `${appUrl}${href.startsWith("/") ? href : `/${href}`}`;
}

export async function sendOtpEmail({ email, code }: { email: string; code: string }) {
  assertEmailConfig();
  const from = process.env.AUTH_EMAIL_FROM as string;

  await resend!.emails.send({
    from,
    to: email,
    subject: "Your MagneticICT verification code",
    html: `
      <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
        <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
          <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">Confirm your sign-in</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">Use the verification code below to continue your secure sign-in. The code expires in 10 minutes.</p>
          <div style="margin:0 0 24px;padding:20px;border-radius:20px;background:linear-gradient(135deg,#7c3aed,#06b6d4);font-size:32px;font-weight:700;letter-spacing:0.35em;text-align:center;color:white">${code}</div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#94a3b8">If you did not request this code, you can safely ignore this email.</p>
        </div>
      </div>
    `
  });
}

export async function sendWelcomeEmail({ email, customerName }: { email: string; customerName?: string | null }) {
  assertEmailConfig();
  const from = process.env.AUTH_EMAIL_FROM as string;
  const settings = await getPlatformSettings();
  const config = settings.welcomeEmailConfig;

  if (!config.enabled) {
    return;
  }

  const ctaHref = resolveEmailHref(config.ctaHref);

  await resend!.emails.send({
    from,
    to: email,
    subject: config.subject,
    html: `
      <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
        <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
          <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${config.headline}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">Hello ${customerName || "there"}, ${config.body}</p>
          <a href="${ctaHref}" style="display:inline-block;margin:0 0 24px;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#06b6d4);font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${config.ctaLabel}</a>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#94a3b8">We are ready to help you launch, manage, and grow with MagneticICT.</p>
        </div>
      </div>
    `
  });
}

export async function sendOrderStatusEmail({
  email,
  customerName,
  serviceName,
  tierName,
  amount,
  status,
  invoiceNumber
}: {
  email: string;
  customerName?: string | null;
  serviceName: string;
  tierName: string;
  amount: number;
  status: "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  invoiceNumber?: string | null;
}) {
  assertEmailConfig();
  const from = process.env.AUTH_EMAIL_FROM as string;

  const statusTitles = {
    PAID: "Payment confirmed",
    FAILED: "Payment failed",
    CANCELLED: "Order cancelled",
    FULFILLED: "Service fulfilled"
  } as const;

  const statusDescriptions = {
    PAID: "Your order has been paid successfully and is now in our delivery pipeline.",
    FAILED: "We were unable to complete your payment. You can return to checkout and try again.",
    CANCELLED: "Your checkout was cancelled before payment completed. Your order remains inactive until you retry.",
    FULFILLED: "Your premium service order has been fulfilled and is now active in your workspace."
  } as const;

  await resend!.emails.send({
    from,
    to: email,
    subject: `MagneticICT update: ${statusTitles[status]}`,
    html: `
      <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
        <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
          <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${statusTitles[status]}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">Hello ${customerName || "there"}, ${statusDescriptions[status]}</p>
          <div style="margin:0 0 24px;padding:24px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0 0 8px;font-size:14px;color:#94a3b8">Service</p>
            <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#ffffff">${serviceName} — ${tierName}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#94a3b8">Amount</p>
            <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#ffffff">$${amount.toFixed(2)}</p>
            ${invoiceNumber ? `<p style="margin:0;font-size:14px;color:#94a3b8">Invoice: <span style="color:#ffffff">${invoiceNumber}</span></p>` : ""}
          </div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#94a3b8">You can review the latest status from your MagneticICT dashboard at any time.</p>
        </div>
      </div>
    `
  });
}
