import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";
import { sendInfobipTemplate } from "@/lib/social-bot-rag";

const bodySchema = z.object({
  to: z.string().min(5),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  senderNumber: z.string().optional(),
  templateName: z.string().optional(),
  templateLanguage: z.string().optional(),
  templateBodyPlaceholder: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid recipient phone number (to)." }, { status: 400 });
  }

  const settings = await getPlatformSettings();
  const cfg = settings.infobipConfig;

  const apiKey = (parsed.data.apiKey ?? cfg.apiKey).trim();
  const baseUrl = (parsed.data.baseUrl ?? cfg.baseUrl).trim();
  const senderNumber = (parsed.data.senderNumber ?? cfg.senderNumber).trim();
  const templateName = (parsed.data.templateName ?? cfg.templateName).trim();
  const templateLanguage = (parsed.data.templateLanguage ?? cfg.templateLanguage).trim() || "en";
  const placeholder = (parsed.data.templateBodyPlaceholder ?? cfg.templateBodyPlaceholder).trim();

  if (!apiKey || !baseUrl || !senderNumber) {
    return NextResponse.json({ error: "API Key, Base URL, and Sender Number must be configured before sending a test." }, { status: 400 });
  }

  if (!templateName) {
    return NextResponse.json({ error: "Template name is required for sending a test template message." }, { status: 400 });
  }

  try {
    await sendInfobipTemplate({
      to: parsed.data.to,
      apiKey,
      baseUrl,
      senderNumber,
      templateName,
      templateLanguage,
      bodyPlaceholders: placeholder ? [placeholder] : []
    });

    return NextResponse.json({
      ok: true,
      message: `Template "${templateName}" sent to ${parsed.data.to} via Infobip.`
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
