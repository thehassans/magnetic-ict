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
    <div style="background-color:#030014;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;text-align:center">
      <div style="max-width:600px;margin:0 auto;background:linear-gradient(145deg,rgba(30,41,59,0.7) 0%,rgba(15,23,42,0.9) 100%);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5),0 0 40px rgba(139,92,246,0.15);text-align:left">
        <div style="padding:48px">
          <div style="margin-bottom:32px">
            <span style="background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);color:#c4b5fd;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;padding:6px 12px;border-radius:100px">Magnetic Social Bot</span>
          </div>
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.1">
            You've been invited to join the <span style="color:#a78bfa">conversation.</span>
          </h1>
          <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#94a3b8">
            <strong style="color:#ffffff">${inviterName}</strong> has invited you to collaborate on the Magnetic Social Bot workspace. Connect, automate, and manage your WhatsApp and social channels instantly.
          </p>
          
          <div style="margin-bottom:40px">
            <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-size:15px;font-weight:600;letter-spacing:0.02em;box-shadow:0 10px 20px -5px rgba(109,40,217,0.5);border:1px solid rgba(255,255,255,0.1)">
              Accept Invitation →
            </a>
          </div>
          
          <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:24px">
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:500">Alternatively, copy and paste this secure link into your browser:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#cbd5e1;word-break:break-all;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;font-family:monospace;border:1px solid rgba(255,255,255,0.03)">${inviteLink}</p>
            <p style="margin:0;font-size:12px;color:#475569">This invitation is valid for 7 days. If you're not expecting this, you can safely ignore it.</p>
          </div>
        </div>
      </div>
      <p style="margin:32px 0 0;font-size:12px;color:#475569">© ${new Date().getFullYear()} Magnetic ICT. All rights reserved.</p>
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
