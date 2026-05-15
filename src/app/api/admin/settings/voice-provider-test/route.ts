import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  provider: z.enum(["twilio", "vonage", "plivo", "telnyx"]),
  // Per-provider credentials — fall back to saved settings if omitted
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  authId: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { provider } = parsed.data;
  const settings = await getPlatformSettings();
  const cfg = settings.voiceProviderConfig;

  // ── Twilio ──────────────────────────────────────────────────────────────────
  if (provider === "twilio") {
    const accountSid = (parsed.data.accountSid ?? cfg.twilio.accountSid).trim();
    const authToken = (parsed.data.authToken ?? cfg.twilio.authToken).trim();

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "Twilio Account SID and Auth Token are required." }, { status: 400 });
    }

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
          }
        }
      );
      const data = (await res.json().catch(() => ({}))) as { friendly_name?: string; status?: string; message?: string };
      if (!res.ok) {
        return NextResponse.json({ error: data.message ?? "Twilio authentication failed." }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        message: `Twilio connected — account "${data.friendly_name ?? accountSid}" (${data.status ?? "active"}).`
      });
    } catch {
      return NextResponse.json({ error: "Unable to reach Twilio API." }, { status: 500 });
    }
  }

  // ── Vonage / Nexmo ───────────────────────────────────────────────────────────
  if (provider === "vonage") {
    const apiKey = (parsed.data.apiKey ?? cfg.vonage.apiKey).trim();
    const apiSecret = (parsed.data.apiSecret ?? cfg.vonage.apiSecret).trim();

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Vonage API Key and Secret are required." }, { status: 400 });
    }

    try {
      const res = await fetch(
        `https://rest.nexmo.com/account/get-balance?api_key=${encodeURIComponent(apiKey)}&api_secret=${encodeURIComponent(apiSecret)}`
      );
      const data = (await res.json().catch(() => ({}))) as { value?: number; autoReload?: boolean; error_text?: string };
      if (!res.ok || data.error_text) {
        return NextResponse.json({ error: data.error_text ?? "Vonage authentication failed." }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        message: `Vonage connected — balance €${(data.value ?? 0).toFixed(2)}${data.autoReload ? " (auto-reload on)" : ""}.`
      });
    } catch {
      return NextResponse.json({ error: "Unable to reach Vonage API." }, { status: 500 });
    }
  }

  // ── Plivo ────────────────────────────────────────────────────────────────────
  if (provider === "plivo") {
    const authId = (parsed.data.authId ?? cfg.plivo.authId).trim();
    const authToken = (parsed.data.authToken ?? cfg.plivo.authToken).trim();

    if (!authId || !authToken) {
      return NextResponse.json({ error: "Plivo Auth ID and Auth Token are required." }, { status: 400 });
    }

    try {
      const res = await fetch(
        `https://api.plivo.com/v1/Account/${authId}/`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${authId}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/json"
          }
        }
      );
      const data = (await res.json().catch(() => ({}))) as { account_type?: string; cash_credits?: string; api_id?: string; error?: string };
      if (!res.ok) {
        return NextResponse.json({ error: data.error ?? "Plivo authentication failed." }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        message: `Plivo connected — ${data.account_type ?? "account"} · balance $${Number(data.cash_credits ?? 0).toFixed(2)}.`
      });
    } catch {
      return NextResponse.json({ error: "Unable to reach Plivo API." }, { status: 500 });
    }
  }

  // ── Telnyx ───────────────────────────────────────────────────────────────────
  if (provider === "telnyx") {
    const apiKey = (parsed.data.apiKey ?? cfg.telnyx.apiKey).trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Telnyx API Key is required." }, { status: 400 });
    }

    try {
      const res = await fetch("https://api.telnyx.com/v2/balance", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { available_credit?: string; balance?: string; record_type?: string }; errors?: { detail?: string }[] };
      if (!res.ok) {
        const errMsg = json.errors?.[0]?.detail ?? "Telnyx authentication failed.";
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }
      const balance = json.data?.balance ?? json.data?.available_credit ?? "0";
      return NextResponse.json({
        ok: true,
        message: `Telnyx connected — balance $${Number(balance).toFixed(2)}.`
      });
    } catch {
      return NextResponse.json({ error: "Unable to reach Telnyx API." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
}
