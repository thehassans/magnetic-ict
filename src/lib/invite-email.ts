import { getPlatformSettings } from "@/lib/platform-settings";

function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://magnetic-ict.com"
  ).replace(/\/$/, "");
}

async function resolveEmailProvider(cfg: { mailgunApiKey?: string; brevoApiKey?: string; resendApiKey?: string }) {
  if (cfg.mailgunApiKey?.trim()) return "mailgun";
  if (cfg.brevoApiKey?.trim()) return "brevo";
  if ((cfg as { resendApiKey?: string }).resendApiKey?.trim()) return "resend";
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
  const cfg = settings.transactionalEmailConfig as {
    fromEmail?: string;
    fromName?: string;
    mailgunApiKey?: string;
    mailgunDomain?: string;
    brevoApiKey?: string;
    resendApiKey?: string;
  };

  const provider = await resolveEmailProvider(cfg);
  if (provider === "none") throw new Error("No email provider configured.");

  const appUrl = getAppUrl();
  const chatbotUrl = (process.env.NEXT_PUBLIC_CHATBOT_URL ?? `https://chatbot.magnetic-ict.com`).replace(/\/$/, "");
  const inviteLink = `${appUrl}/invite/${token}`;
  const fromEmail = cfg.fromEmail ?? "noreply@magnetic-ict.com";
  const fromName = cfg.fromName ?? "Magnetic ICT";

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
    const domain = cfg.mailgunDomain ?? "";
    const form = new URLSearchParams({ from: `${fromName} <${fromEmail}>`, to: inviteeEmail, subject, html });
    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${cfg.mailgunApiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });
    if (!res.ok) throw new Error(`Mailgun error: ${res.statusText}`);
  } else if (provider === "brevo") {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": cfg.brevoApiKey!, "Content-Type": "application/json" },
      body: JSON.stringify({ sender: { name: fromName, email: fromEmail }, to: [{ email: inviteeEmail }], subject, htmlContent: html })
    });
    if (!res.ok) throw new Error(`Brevo error: ${res.statusText}`);
  } else {
    const { Resend } = await import("resend");
    const resend = new Resend((cfg as { resendApiKey?: string }).resendApiKey);
    await resend.emails.send({ from: `${fromName} <${fromEmail}>`, to: inviteeEmail, subject, html });
  }

  void chatbotUrl;
}
