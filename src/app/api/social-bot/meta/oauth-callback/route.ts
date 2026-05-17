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

  if (ok && code) {
    try {
      const settings = await getPlatformSettings();
      const { metaAppId, metaAppSecret } = settings.socialBotConfig;
      const redirectUri = `${url.protocol}//${url.host}/api/social-bot/meta/oauth-callback`;

      if (metaAppId && metaAppSecret) {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v19.0/oauth/access_token` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&client_secret=${encodeURIComponent(metaAppSecret)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&code=${encodeURIComponent(code)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (tokenRes.ok) {
          const { access_token: userToken } = await tokenRes.json() as { access_token?: string };
          if (userToken) {
            const pagesRes = await fetch(
              `https://graph.facebook.com/v19.0/me/accounts` +
              `?fields=id,name,access_token` +
              `&access_token=${encodeURIComponent(userToken)}`,
              { signal: AbortSignal.timeout(8000) }
            );
            if (pagesRes.ok) {
              const pagesData = await pagesRes.json() as { data?: FbPage[] };
              pages = pagesData.data ?? [];
            }
          }
        }
      }
    } catch { /* ignore — still mark ok so the connect flow can proceed */ }
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
  <p>${ok ? "Connected! Closing window\u2026" : `Error: ${errMsg ?? "Cancelled"}`}</p>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage(
          { type: "fb-connect", ok: ${ok}, channel: ${JSON.stringify(state)}, error: ${JSON.stringify(errMsg)}, pages: ${JSON.stringify(pages)} },
          window.location.origin
        );
      }
    } catch (_) {}
    setTimeout(function () { window.close(); }, 800);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
