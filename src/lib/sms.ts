/**
 * SMS sending via TextBelt (https://textbelt.com)
 *
 * Free tier: 1 SMS/day using key "textbelt" — no signup required.
 * Paid:      Buy credits at textbelt.com ($3 for 100 SMS, no subscription).
 *
 * Set TEXTBELT_API_KEY in .env:
 *   - "textbelt"         → 1 free SMS per day (good for testing)
 *   - "<purchased-key>"  → paid credits (production use)
 */

export type SmsSendResult =
  | { ok: true; textId: string; quotaRemaining: number }
  | { ok: false; error: string };

export async function sendSms(phone: string, message: string): Promise<SmsSendResult> {
  const apiKey = process.env.TEXTBELT_API_KEY || "textbelt";

  try {
    const res = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key: apiKey }),
    });

    if (!res.ok) {
      return { ok: false, error: `TextBelt HTTP error: ${res.status}` };
    }

    const data = (await res.json()) as {
      success: boolean;
      textId?: string;
      quotaRemaining?: number;
      error?: string;
    };

    if (!data.success) {
      return { ok: false, error: data.error ?? "SMS delivery failed" };
    }

    return {
      ok: true,
      textId: data.textId ?? "",
      quotaRemaining: data.quotaRemaining ?? 0,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
