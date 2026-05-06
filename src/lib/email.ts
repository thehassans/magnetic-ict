import { Resend } from "resend";
import { createEmailLog } from "@/lib/email-logs";
import {
  getEmailNotificationsSettings,
  getPlatformSettings,
  type EmailNotificationKey,
  type TransactionalEmailSettings
} from "@/lib/platform-settings";

const resend = process.env.AUTH_RESEND_KEY ? new Resend(process.env.AUTH_RESEND_KEY) : null;

type EmailProvider = "mailgun" | "resend" | "none";

type TransactionalMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string | null;
  tags?: string[];
};

function getFallbackAuthFrom() {
  return process.env.AUTH_EMAIL_FROM?.trim() || "";
}

export async function sendOrderPlacedEmail(args: {
  email: string;
  customerName?: string | null;
  serviceName: string;
  tierName: string;
  amount: number;
}) {
  await sendNotificationTemplateEmail({
    category: "order_placed",
    notificationKey: "orderPlaced",
    email: args.email,
    customerName: args.customerName,
    subject: "MagneticICT update: Order placed",
    headline: "Order placed",
    body: "We received your new order and queued it for the next fulfillment step.",
    detailLines: [
      { label: "Service", value: `${args.serviceName} — ${args.tierName}` },
      { label: "Amount", value: `$${args.amount.toFixed(2)}` }
    ],
    tags: ["order-placed"],
    metadata: { serviceName: args.serviceName, tierName: args.tierName, amount: args.amount }
  });
}

export async function sendOrderProcessingEmail(args: {
  email: string;
  customerName?: string | null;
  serviceName: string;
  tierName: string;
  amount: number;
  invoiceNumber?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "order_processing",
    notificationKey: "orderProcessing",
    email: args.email,
    customerName: args.customerName,
    subject: "MagneticICT update: Order processing",
    headline: "Order processing",
    body: "Your order is now moving through delivery and operational setup.",
    detailLines: [
      { label: "Service", value: `${args.serviceName} — ${args.tierName}` },
      { label: "Amount", value: `$${args.amount.toFixed(2)}` },
      ...(args.invoiceNumber ? [{ label: "Invoice", value: args.invoiceNumber }] : [])
    ],
    tags: ["order-processing"],
    metadata: { serviceName: args.serviceName, tierName: args.tierName, amount: args.amount, invoiceNumber: args.invoiceNumber ?? null }
  });
}

export async function sendInvoiceGeneratedEmail(args: {
  email: string;
  customerName?: string | null;
  invoiceNumber: string;
  amount: number;
  serviceName: string;
}) {
  await sendNotificationTemplateEmail({
    category: "invoice_generated",
    notificationKey: "invoiceGenerated",
    email: args.email,
    customerName: args.customerName,
    subject: `MagneticICT invoice ${args.invoiceNumber}`,
    headline: "Invoice generated",
    body: "A new invoice has been created for your order.",
    detailLines: [
      { label: "Invoice", value: args.invoiceNumber },
      { label: "Service", value: args.serviceName },
      { label: "Amount", value: `$${args.amount.toFixed(2)}` }
    ],
    tags: ["invoice-generated"],
    metadata: { invoiceNumber: args.invoiceNumber, amount: args.amount, serviceName: args.serviceName }
  });
}

export async function sendPaymentReceivedEmail(args: {
  email: string;
  customerName?: string | null;
  amount: number;
  serviceName: string;
  invoiceNumber?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "payment_received",
    notificationKey: "paymentReceived",
    email: args.email,
    customerName: args.customerName,
    subject: "MagneticICT update: Payment received",
    headline: "Payment received",
    body: "We successfully received your payment and matched it to your order.",
    detailLines: [
      { label: "Service", value: args.serviceName },
      { label: "Amount", value: `$${args.amount.toFixed(2)}` },
      ...(args.invoiceNumber ? [{ label: "Invoice", value: args.invoiceNumber }] : [])
    ],
    tags: ["payment-received"],
    metadata: { amount: args.amount, serviceName: args.serviceName, invoiceNumber: args.invoiceNumber ?? null }
  });
}

function formatEmailDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export async function sendPasswordResetEmail(args: {
  email: string;
  customerName?: string | null;
  code: string;
}) {
  await sendNotificationTemplateEmail({
    category: "password_reset",
    notificationKey: "passwordReset",
    email: args.email,
    customerName: args.customerName,
    subject: "MagneticICT secure access code",
    headline: "Secure access requested",
    body: "we received a request to access your account. Use the secure code below to continue.",
    detailLines: [{ label: "Verification code", value: args.code }],
    tags: ["password-reset", "account-access"],
    metadata: { codeLength: args.code.length }
  });
}

export async function sendNewsletterSubscriptionEmail(args: {
  email: string;
  customerName?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "newsletter_subscription",
    notificationKey: "newsletterSubscription",
    email: args.email,
    customerName: args.customerName,
    subject: "MagneticICT newsletter subscription confirmed",
    headline: "Subscription confirmed",
    body: "you are now subscribed to MagneticICT updates. We will send occasional product, service, and operations announcements.",
    detailLines: [{ label: "Subscription email", value: args.email }],
    tags: ["newsletter-subscription"],
    metadata: { subscriberEmail: args.email }
  });
}

export async function sendTicketCreatedEmail(args: {
  email: string;
  customerName?: string | null;
  ticketId: string;
  subjectLine: string;
  category?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "ticket_created",
    notificationKey: "ticketCreated",
    email: args.email,
    customerName: args.customerName,
    subject: `Support ticket received · ${args.subjectLine}`,
    headline: "Ticket created",
    body: "your support request is now in our queue. Our team will review it and follow up as soon as possible.",
    detailLines: [
      { label: "Ticket ID", value: args.ticketId },
      { label: "Subject", value: args.subjectLine },
      ...(args.category ? [{ label: "Category", value: args.category }] : [])
    ],
    tags: ["ticket-created"],
    metadata: { ticketId: args.ticketId, subjectLine: args.subjectLine, category: args.category ?? null }
  });
}

export async function sendTicketReplyEmail(args: {
  email: string;
  customerName?: string | null;
  ticketId: string;
  subjectLine: string;
  repliedBy: string;
  replyPreview: string;
}) {
  await sendNotificationTemplateEmail({
    category: "ticket_reply",
    notificationKey: "ticketReply",
    email: args.email,
    customerName: args.customerName,
    subject: `Support ticket updated · ${args.subjectLine}`,
    headline: "Ticket reply received",
    body: "there is a new update on your support ticket.",
    detailLines: [
      { label: "Ticket ID", value: args.ticketId },
      { label: "Replied by", value: args.repliedBy },
      { label: "Latest reply", value: args.replyPreview }
    ],
    tags: ["ticket-reply"],
    metadata: { ticketId: args.ticketId, subjectLine: args.subjectLine, repliedBy: args.repliedBy }
  });
}

export async function sendTicketClosedEmail(args: {
  email: string;
  customerName?: string | null;
  ticketId: string;
  subjectLine: string;
}) {
  await sendNotificationTemplateEmail({
    category: "ticket_closed",
    notificationKey: "ticketClosed",
    email: args.email,
    customerName: args.customerName,
    subject: `Support ticket closed · ${args.subjectLine}`,
    headline: "Ticket closed",
    body: "your support ticket has been closed. If you still need help, you can open a new request at any time.",
    detailLines: [
      { label: "Ticket ID", value: args.ticketId },
      { label: "Subject", value: args.subjectLine }
    ],
    tags: ["ticket-closed"],
    metadata: { ticketId: args.ticketId, subjectLine: args.subjectLine }
  });
}

export async function sendServiceExpiringEmail(args: {
  email: string;
  customerName?: string | null;
  serviceName: string;
  tierName?: string | null;
  expiresAt?: string | null;
  reference?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "service_expiring",
    notificationKey: "serviceExpiring",
    email: args.email,
    customerName: args.customerName,
    subject: `MagneticICT notice: ${args.serviceName} is expiring soon`,
    headline: "Service expiring",
    body: "your service is approaching its expiry window. Review the service in your dashboard and renew or contact support if you need help.",
    detailLines: [
      { label: "Service", value: args.tierName ? `${args.serviceName} — ${args.tierName}` : args.serviceName },
      ...(args.expiresAt ? [{ label: "Expires", value: formatEmailDate(args.expiresAt) }] : []),
      ...(args.reference ? [{ label: "Reference", value: args.reference }] : [])
    ],
    tags: ["service-expiring"],
    metadata: { serviceName: args.serviceName, tierName: args.tierName ?? null, expiresAt: args.expiresAt ?? null, reference: args.reference ?? null }
  });
}

export async function sendServiceSuspendedEmail(args: {
  email: string;
  customerName?: string | null;
  serviceName: string;
  tierName?: string | null;
  reason?: string | null;
  reference?: string | null;
}) {
  await sendNotificationTemplateEmail({
    category: "service_suspended",
    notificationKey: "serviceSuspended",
    email: args.email,
    customerName: args.customerName,
    subject: `MagneticICT notice: ${args.serviceName} has been suspended`,
    headline: "Service suspended",
    body: "your service is currently suspended. Review the details below and contact support if you need assistance restoring access.",
    detailLines: [
      { label: "Service", value: args.tierName ? `${args.serviceName} — ${args.tierName}` : args.serviceName },
      ...(args.reference ? [{ label: "Reference", value: args.reference }] : []),
      ...(args.reason ? [{ label: "Reason", value: args.reason }] : [])
    ],
    tags: ["service-suspended"],
    metadata: { serviceName: args.serviceName, tierName: args.tierName ?? null, reason: args.reason ?? null, reference: args.reference ?? null }
  });
}

function getMailgunApiUrl(settings: TransactionalEmailSettings) {
  const baseUrl = settings.apiBaseUrl.replace(/\/$/, "");
  return `${baseUrl}/v3/${settings.domain}/messages`;
}

function hasMailgunConfig(settings: TransactionalEmailSettings) {
  return Boolean(
    settings.enabled
      && settings.apiBaseUrl.trim()
      && settings.apiKey.trim()
      && settings.domain.trim()
      && settings.fromEmail.trim()
  );
}

function hasResendFallback() {
  return Boolean(resend && getFallbackAuthFrom());
}

async function resolveEmailProvider(settings: TransactionalEmailSettings): Promise<EmailProvider> {
  if (hasMailgunConfig(settings)) {
    return "mailgun";
  }

  if (hasResendFallback()) {
    return "resend";
  }

  return "none";
}

async function logEmail(args: {
  category: string;
  notificationKey: EmailNotificationKey | null;
  provider: EmailProvider;
  status: "sent" | "failed" | "skipped";
  to: string;
  subject: string;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await createEmailLog({
    category: args.category,
    notificationKey: args.notificationKey,
    provider: args.provider,
    status: args.status,
    to: args.to,
    subject: args.subject,
    errorMessage: args.errorMessage ?? null,
    metadata: args.metadata ?? null
  }).catch(() => null);
}

async function sendViaMailgun(settings: TransactionalEmailSettings, message: TransactionalMessage) {
  const formData = new URLSearchParams();
  formData.set("from", `${settings.fromName.trim() || "MagneticICT"} <${settings.fromEmail.trim()}>`);
  formData.set("to", message.to);
  formData.set("subject", message.subject);
  formData.set("html", message.html);

  const replyTo = message.replyTo?.trim() || settings.replyToEmail.trim();

  if (replyTo) {
    formData.set("h:Reply-To", replyTo);
  }

  for (const tag of message.tags ?? []) {
    formData.append("o:tag", tag);
  }

  const response = await fetch(getMailgunApiUrl(settings), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${settings.apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || `Mailgun request failed with status ${response.status}.`);
  }
}

async function sendViaResend(message: TransactionalMessage) {
  if (!resend) {
    throw new Error("Fallback Resend client is unavailable.");
  }

  const from = getFallbackAuthFrom();

  if (!from) {
    throw new Error("AUTH_EMAIL_FROM is not configured.");
  }

  await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    replyTo: message.replyTo || undefined
  });
}

async function sendConfiguredEmail(
  message: TransactionalMessage,
  args: {
    category: string;
    notificationKey: EmailNotificationKey | null;
    metadata?: Record<string, unknown> | null;
  }
) {
  const settings = await getPlatformSettings();
  const provider = await resolveEmailProvider(settings.transactionalEmailConfig);

  if (provider === "none") {
    await logEmail({
      category: args.category,
      notificationKey: args.notificationKey,
      provider,
      status: "failed",
      to: message.to,
      subject: message.subject,
      errorMessage: "No transactional email provider is configured.",
      metadata: args.metadata ?? null
    });
    throw new Error("No transactional email provider is configured.");
  }

  try {
    if (provider === "mailgun") {
      await sendViaMailgun(settings.transactionalEmailConfig, message);
    } else {
      await sendViaResend(message);
    }

    await logEmail({
      category: args.category,
      notificationKey: args.notificationKey,
      provider,
      status: "sent",
      to: message.to,
      subject: message.subject,
      metadata: args.metadata ?? null
    });
  } catch (error) {
    await logEmail({
      category: args.category,
      notificationKey: args.notificationKey,
      provider,
      status: "failed",
      to: message.to,
      subject: message.subject,
      errorMessage: error instanceof Error ? error.message : "Email send failed.",
      metadata: args.metadata ?? null
    });
    throw error;
  }
}

async function isNotificationEnabled(key: EmailNotificationKey) {
  const settings = await getEmailNotificationsSettings();
  return settings[key];
}

async function sendNotificationTemplateEmail(args: {
  category: string;
  notificationKey: EmailNotificationKey;
  email: string;
  customerName?: string | null;
  subject: string;
  headline: string;
  body: string;
  detailLines?: Array<{ label: string; value: string }>;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
}) {
  if (!(await isNotificationEnabled(args.notificationKey))) {
    await logEmail({
      category: args.category,
      notificationKey: args.notificationKey,
      provider: "none",
      status: "skipped",
      to: args.email,
      subject: args.subject,
      metadata: { ...(args.metadata ?? {}), reason: "disabled" }
    });
    return;
  }

  const detailsMarkup = args.detailLines?.length
    ? `
        <div style="margin:0 0 24px;padding:24px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)">
          ${args.detailLines
            .map(
              (line) => `
                <p style="margin:0 0 8px;font-size:14px;color:#94a3b8">${line.label}</p>
                <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#ffffff">${line.value}</p>
              `
            )
            .join("")}
        </div>
      `
    : "";

  await sendConfiguredEmail(
    {
      to: args.email,
      subject: args.subject,
      html: `
        <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
          <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
            <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${args.headline}</h1>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">Hello ${args.customerName || "there"}, ${args.body}</p>
            ${detailsMarkup}
            <p style="margin:0;font-size:14px;line-height:1.6;color:#94a3b8">You can review the latest updates from your MagneticICT dashboard at any time.</p>
          </div>
        </div>
      `,
      tags: args.tags
    },
    {
      category: args.category,
      notificationKey: args.notificationKey,
      metadata: args.metadata ?? null
    }
  );
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
  await sendConfiguredEmail(
    {
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
    `,
      tags: ["otp"]
    },
    {
      category: "otp",
      notificationKey: null,
      metadata: { codeLength: code.length }
    }
  );
}

export async function sendWelcomeEmail({ email, customerName }: { email: string; customerName?: string | null }) {
  const settings = await getPlatformSettings();
  const config = settings.welcomeEmailConfig;

  if (!config.enabled || !(await isNotificationEnabled("welcomeEmail"))) {
    await logEmail({
      category: "welcome_email",
      notificationKey: "welcomeEmail",
      provider: "none",
      status: "skipped",
      to: email,
      subject: config.subject,
      metadata: { reason: "disabled" }
    });
    return;
  }

  const ctaHref = resolveEmailHref(config.ctaHref);

  await sendConfiguredEmail(
    {
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
    `,
      tags: ["welcome-email"]
    },
    {
      category: "welcome_email",
      notificationKey: "welcomeEmail",
      metadata: { customerName: customerName || null }
    }
  );
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

  const notificationKeyByStatus = {
    PAID: "orderConfirmed",
    FAILED: null,
    CANCELLED: "orderCancelled",
    FULFILLED: "orderCompleted"
  } as const satisfies Record<typeof status, EmailNotificationKey | null>;

  const notificationKey = notificationKeyByStatus[status];

  if (notificationKey && !(await isNotificationEnabled(notificationKey))) {
    await logEmail({
      category: "order_status",
      notificationKey,
      provider: "none",
      status: "skipped",
      to: email,
      subject: `MagneticICT update: ${statusTitles[status]}`,
      metadata: { serviceName, tierName, amount, status, invoiceNumber: invoiceNumber ?? null, reason: "disabled" }
    });
    return;
  }

  await sendConfiguredEmail(
    {
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
    `,
      tags: ["order-status", status.toLowerCase()]
    },
    {
      category: "order_status",
      notificationKey,
      metadata: { serviceName, tierName, amount, status, invoiceNumber: invoiceNumber ?? null }
    }
  );
}

export async function sendMailgunTestEmail(args?: Partial<TransactionalEmailSettings> & { recipient?: string }) {
  const settings = await getPlatformSettings();
  const effectiveConfig: TransactionalEmailSettings = {
    ...settings.transactionalEmailConfig,
    ...args,
    provider: "mailgun"
  };
  const recipient = args?.recipient?.trim() || effectiveConfig.testRecipient.trim();

  if (!recipient) {
    throw new Error("Add a test recipient before sending a test email.");
  }

  if (!hasMailgunConfig(effectiveConfig)) {
    throw new Error("Complete the Mailgun configuration before testing email delivery.");
  }

  const previewHtml = `
    <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
      <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
        <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">Mailgun configuration successful</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">This is a test email from the MagneticICT admin panel. Your transactional email configuration is ready.</p>
        <div style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)">
          <p style="margin:0 0 8px;font-size:14px;color:#94a3b8">Provider</p>
          <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#ffffff">Mailgun</p>
          <p style="margin:0 0 8px;font-size:14px;color:#94a3b8">Domain</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff">${effectiveConfig.domain}</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendViaMailgun(effectiveConfig, {
      to: recipient,
      subject: "MagneticICT test email",
      html: previewHtml,
      replyTo: effectiveConfig.replyToEmail,
      tags: ["test-email"]
    });

    await logEmail({
      category: "test_email",
      notificationKey: null,
      provider: "mailgun",
      status: "sent",
      to: recipient,
      subject: "MagneticICT test email",
      metadata: { domain: effectiveConfig.domain, fromEmail: effectiveConfig.fromEmail }
    });
  } catch (error) {
    await logEmail({
      category: "test_email",
      notificationKey: null,
      provider: "mailgun",
      status: "failed",
      to: recipient,
      subject: "MagneticICT test email",
      errorMessage: error instanceof Error ? error.message : "Mailgun test failed.",
      metadata: { domain: effectiveConfig.domain, fromEmail: effectiveConfig.fromEmail }
    });
    throw error;
  }
}
