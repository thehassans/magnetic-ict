import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    apiKey?: string;
    baseUrl?: string;
  };

  const settings = await getPlatformSettings();
  const cfg = settings.infobipConfig;

  const apiKey = (body.apiKey ?? cfg.apiKey).trim();
  const baseUrl = (body.baseUrl ?? cfg.baseUrl).trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: "API Key and Base URL are required before testing." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://${baseUrl}/account/1/info`, {
      headers: {
        Authorization: `App ${apiKey}`,
        Accept: "application/json"
      }
    });

    const data = (await res.json().catch(() => ({}))) as {
      accountBalance?: number;
      accountCurrency?: string;
      paymentModel?: string;
      requestError?: { serviceException?: { text?: string } };
    };

    if (!res.ok) {
      const msg = data.requestError?.serviceException?.text ?? "Infobip authentication failed — check your API Key and Base URL.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const balance = data.accountBalance !== undefined ? ` · Balance: ${data.accountCurrency ?? ""}${data.accountBalance.toFixed(2)}` : "";
    const model = data.paymentModel ? ` (${data.paymentModel})` : "";

    return NextResponse.json({
      ok: true,
      message: `Infobip connected${model}${balance}.`
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach Infobip API — check your Base URL." }, { status: 500 });
  }
}
