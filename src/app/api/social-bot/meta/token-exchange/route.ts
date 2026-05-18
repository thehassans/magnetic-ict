import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

export const runtime = "nodejs";

/**
 * POST /api/social-bot/meta/token-exchange
 *
 * Exchanges a short-lived Meta user access token (1–2 hrs) for a long-lived
 * token (60 days). Call this from the Social Bot integration setup UI after
 * the user completes Facebook Embedded Signup.
 *
 * Body: { shortLivedToken: string }
 * Returns: { accessToken: string; expiresIn: number; tokenType: string }
 *
 * Reference: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 */
export async function POST(request: Request) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const session = await getRequiredUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let shortLivedToken: string;
  try {
    const body = (await request.json()) as { shortLivedToken?: string };
    shortLivedToken = (body.shortLivedToken ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!shortLivedToken) {
    return NextResponse.json(
      { error: "shortLivedToken is required." },
      { status: 400 }
    );
  }

  // ── Load Meta credentials from platform settings ───────────────────────────
  const settings = await getPlatformSettings();
  const { metaAppId, metaAppSecret } = settings.socialBotConfig;

  if (!metaAppId || !metaAppSecret) {
    return NextResponse.json(
      {
        error:
          "Meta App ID or App Secret is not configured. Go to Admin › Social Bot › Meta Settings and save your credentials first."
      },
      { status: 503 }
    );
  }

  // ── Exchange token via Graph API ───────────────────────────────────────────
  const exchangeUrl =
    `https://graph.facebook.com/v25.0/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${encodeURIComponent(metaAppId)}` +
    `&client_secret=${encodeURIComponent(metaAppSecret)}` +
    `&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;

  let exchangeData: {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    error?: { message?: string; type?: string; code?: number };
  };

  try {
    const res = await fetch(exchangeUrl, {
      signal: AbortSignal.timeout(10_000)
    });
    exchangeData = await res.json();

    if (!res.ok || !exchangeData.access_token) {
      const msg =
        exchangeData.error?.message ??
        "Token exchange failed. Verify your App ID, App Secret, and that the short-lived token is still valid.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Network error during token exchange." },
      { status: 500 }
    );
  }

  // ── Return the long-lived token to the caller ──────────────────────────────
  return NextResponse.json({
    ok: true,
    accessToken: exchangeData.access_token,
    tokenType: exchangeData.token_type ?? "bearer",
    // Meta returns seconds; 0 means non-expiring (System User / Page token)
    expiresIn: exchangeData.expires_in ?? 0,
    expiresInDays: exchangeData.expires_in
      ? Math.round(exchangeData.expires_in / 86_400)
      : null,
    note:
      exchangeData.expires_in === 0
        ? "This is a non-expiring token (System User or Page token). Store it securely."
        : `This token expires in approximately ${Math.round((exchangeData.expires_in ?? 5_184_000) / 86_400)} days. Store it in your .env as INSTAGRAM_PAGE_ACCESS_TOKEN.`
  });
}
