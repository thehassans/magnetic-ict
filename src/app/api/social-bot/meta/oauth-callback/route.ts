import { NextResponse } from "next/server";

/**
 * Receives the Facebook OAuth redirect after Embedded Signup completes.
 * Returns a tiny HTML page that sends a postMessage to the opener popup
 * then closes itself. This replaces FB.login() so no JSSDK toggle is needed.
 *
 * Required: add this URL as a Valid OAuth Redirect URI in your Facebook App:
 *   https://chatbot.magnetic-ict.com/api/social-bot/meta/oauth-callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const code = url.searchParams.get("code");

  const ok = !error && Boolean(code);
  const errMsg = errorDesc ?? error ?? null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${ok ? "Connecting…" : "Connection cancelled"}</title>
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
          { type: "fb-connect", ok: ${ok}, channel: ${JSON.stringify(state)}, error: ${JSON.stringify(errMsg)} },
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
