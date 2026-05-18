import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";

type FbPage = { id: string; name: string; access_token: string };

/**
 * Receives the Facebook OAuth redirect after Embedded Signup completes.
 * Exchanges the code for a user token, fetches managed pages, then
 * posts { type:"fb-connect", ok, channel, pages, error } back to the opener.
 *
 * Required: add this URL as a Valid OAuth Redirect URI in your Facebook App.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const code = url.searchParams.get("code");

  const ok = !error && Boolean(code);
  const errMsg = errorDesc ?? error ?? null;

  let pages: FbPage[] = [];
  let fetchError: string | null = null;

  if (ok && code) {
    try {
      const settings = await getPlatformSettings();
      const { metaAppId, metaAppSecret } = settings.socialBotConfig;
      const canonicalBase = (
        process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? `${url.protocol}//${url.host}`
      ).replace(/\/$/, "");
      const redirectUri = `${canonicalBase}/api/social-bot/meta/oauth-callback`;

      if (!metaAppId || !metaAppSecret) {
        fetchError = "Meta App ID or App Secret is not configured in admin settings.";
      } else {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v25.0/oauth/access_token` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&client_secret=${encodeURIComponent(metaAppSecret)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&code=${encodeURIComponent(code)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        const tokenData = await tokenRes.json() as { access_token?: string; error?: { message?: string } };
        if (!tokenRes.ok || !tokenData.access_token) {
          fetchError = tokenData.error?.message ?? "Token exchange failed. Check Meta App credentials and OAuth redirect URI.";
        } else {
          const userToken = tokenData.access_token;
          const isInsta = state === "INSTAGRAM";
          const fields = isInsta ? "id,name,access_token,instagram_business_account" : "id,name,access_token";

          // Fetch pages (include linked IG account only if Instagram channel)
          const pagesRes = await fetch(
            `https://graph.facebook.com/v25.0/me/accounts` +
            `?fields=${fields}` +
            `&access_token=${encodeURIComponent(userToken)}`,
            { signal: AbortSignal.timeout(8000) }
          );
          const pagesData = await pagesRes.json() as {
            data?: Array<{ id: string; name: string; access_token: string; instagram_business_account?: { id: string } }>;
            error?: { message?: string };
          };
          if (!pagesRes.ok) {
            fetchError = pagesData.error?.message ?? "Failed to fetch Facebook Pages.";
          } else {
            // Map to FbPage shape, embedding ig_id as extra field
            pages = (pagesData.data ?? []).map((p) => ({
              id: p.id,
              name: p.name,
              access_token: p.access_token,
              ig_id: p.instagram_business_account?.id ?? ""
            })) as FbPage[];
            if (pages.length === 0) {
              fetchError = "No Facebook Pages found. Meta API returned: " + JSON.stringify(pagesData) + ". Make sure your Facebook Page is linked to your Instagram account.";
            }
          }
        }
      }
    } catch (e) {
      fetchError = e instanceof Error ? e.message : "Unexpected error during OAuth.";
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${ok ? "Connecting\u2026" : "Connection cancelled"}</title>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; font-family: system-ui, sans-serif; background: #f9fafb; }
    p { color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
  <p>${fetchError ? `Error: ${fetchError}` : ok ? "Connected! Closing window\u2026" : `Error: ${errMsg ?? "Cancelled"}`}</p>
  <script>
    var finalError = ${JSON.stringify(fetchError ?? errMsg)};
    var finalOk = ${ok} && !finalError;
    try {
      if (window.opener) {
        window.opener.postMessage(
          { type: "fb-connect", ok: finalOk, channel: ${JSON.stringify(state)}, error: finalError, pages: ${JSON.stringify(pages)} },
          "*"
        );
      }
    } catch (_) {}
    setTimeout(function () { window.close(); }, finalError ? 3000 : 800);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
