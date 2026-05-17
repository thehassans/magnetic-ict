import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

/**
 * Admin-only diagnostic endpoint.
 * Returns: { tokenStored: bool, tokenPrefix: first 8 chars, metaAppIdStored: bool }
 * Visit: /api/admin/social-bot/verify-config while logged in as admin.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }
  const settings = await getPlatformSettings();
  const token = settings.socialBotConfig.webhookVerifyToken;
  return NextResponse.json({
    tokenStored: Boolean(token),
    tokenPrefix: token ? token.slice(0, 8) + "..." : "(empty)",
    metaAppIdStored: Boolean(settings.socialBotConfig.metaAppId),
    metaConfigIdStored: Boolean(settings.socialBotConfig.metaConfigId),
  });
}
