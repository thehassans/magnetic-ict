import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

/**
 * Admin-only diagnostic endpoint.
 * Returns: { tokenStored: bool, tokenPrefix: first 8 chars, metaAppIdStored: bool }
 * Visit: /api/admin/social-bot/verify-config while logged in as admin.
 */
export async function GET() {
  const settings = await getPlatformSettings();
  const token = settings.socialBotConfig.webhookVerifyToken;
  return NextResponse.json({
    tokenStored: Boolean(token),
    tokenPrefix: token ? token.slice(0, 8) + "..." : "(empty — not saved)",
    tokenLength: token.length,
    metaAppIdStored: Boolean(settings.socialBotConfig.metaAppId),
    metaConfigIdStored: Boolean(settings.socialBotConfig.metaConfigId),
  });
}
