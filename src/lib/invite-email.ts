import { getPlatformSettings } from "@/lib/platform-settings";
import type { TransactionalEmailSettings } from "@/lib/platform-settings";
import { Resend } from "resend";

function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://magnetic-ict.com"
  ).replace(/\/$/, "");
}

function hasMailgunConfig(cfg: TransactionalEmailSettings) {
  return Boolean(
    cfg.enabled &&
    cfg.activeProvider === "mailgun" &&
    cfg.apiBaseUrl?.trim() &&
    cfg.apiKey?.trim() &&
    cfg.domain?.trim() &&
    cfg.fromEmail?.trim()
  );
}

function hasBrevoConfig(cfg: TransactionalEmailSettings) {
  return Boolean(
    cfg.enabled &&
    cfg.activeProvider === "brevo" &&
    cfg.brevo?.apiKey?.trim() &&
    cfg.brevo?.fromEmail?.trim()
  );
}

function hasResendFallback() {
  return Boolean(
    process.env.AUTH_RESEND_KEY?.trim() &&
    (process.env.AUTH_EMAIL_FROM?.trim() || process.env.NEXT_PUBLIC_APP_URL)
  );
}

function resolveProvider(cfg: TransactionalEmailSettings): "mailgun" | "brevo" | "resend" | "none" {
  if (hasMailgunConfig(cfg)) return "mailgun";
  if (hasBrevoConfig(cfg)) return "brevo";
  if (hasResendFallback()) return "resend";
  return "none";
}

export async function sendInviteEmail({
  inviterName,
  inviteeEmail,
  token
}: {
  inviterName: string;
  inviteeEmail: string;
  token: string;
}) {
  const settings = await getPlatformSettings();
  const cfg = settings.transactionalEmailConfig;

  const provider = resolveProvider(cfg);
  if (provider === "none") throw new Error("No email provider configured.");

  const appUrl = getAppUrl();
  const inviteLink = `${appUrl}/invite/${token}`;

  const fromEmail =
    provider === "brevo"
      ? cfg.brevo?.fromEmail?.trim() || "noreply@magnetic-ict.com"
      : cfg.fromEmail?.trim() || "noreply@magnetic-ict.com";

  const fromName =
    provider === "brevo"
      ? cfg.brevo?.fromName?.trim() || "Magnetic ICT"
      : cfg.fromName?.trim() || "Magnetic ICT";

  const subject = `${inviterName} invited you to Magnetic Chat`;

  const html = `
    <div style="background:#050816;padding:32px;font-family:Inter,Arial,sans-serif;color:#f8fafc">
      <div style="max-width:560px;margin:0 auto;background:rgba(15,23,42,0.88);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
        <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">MagneticICT</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#ffffff">You're invited!</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1">
          <strong style="color:#ffffff">${inviterName}</strong> has invited you to join <strong style="color:#a78bfa">Magnetic Chat</strong> — an AI-powered messaging platform for WhatsApp, Messenger, and Instagram.
        </p>
        <div style="margin:0 0 24px">
          <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.02em">
            Accept Invitation →
          </a>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b">Or copy this link into your browser:</p>
        <p style="margin:0 0 24px;font-size:12px;color:#475569;word-break:break-all">${inviteLink}</p>
        <p style="margin:0;font-size:13px;color:#475569">This invitation expires in 7 days. If you didn't expect this email you can safely ignore it.</p>
      </div>
    </div>
  `;

  if (provider === "mailgun") {
    const apiBaseUrl = (cfg.apiBaseUrl || "https://api.mailgun.net").replace(/\/$/, "");
    const mailgunUrl = `${apiBaseUrl}/v3/${cfg.domain}/messages`;
    const form = new URLSearchParams({
      from: `${fromName} <${fromEmail}>`,
      to: inviteeEmail,
      subject,
      html
    });
    const res = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${cfg.apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });
    const payload = (await res.json().catch(() => null)) as { message?: string } | null;
    if (!res.ok) {
      throw new Error(payload?.message || `Mailgun error: ${res.statusText}`);
    }

  } else if (provider === "brevo") {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": cfg.brevo.apiKey.trim(),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: inviteeEmail }],
        subject,
        htmlContent: html
      })
    });
    const payload = (await res.json().catch(() => null)) as { message?: string } | null;
    if (!res.ok) {
      throw new Error(payload?.message || `Brevo error: ${res.statusText}`);
    }

  } else {
    // Resend fallback via AUTH_RESEND_KEY
    const resendKey = process.env.AUTH_RESEND_KEY!;
    const resendFrom = process.env.AUTH_EMAIL_FROM?.trim() || `${fromName} <${fromEmail}>`;
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: resendFrom,
      to: inviteeEmail,
      subject,
      html
    });
  }
}
