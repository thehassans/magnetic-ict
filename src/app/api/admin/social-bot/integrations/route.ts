import { NextResponse } from "next/server";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { saveSocialBotIntegration } from "@/lib/social-bot-service";

export async function PATCH(request: Request) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const body = await request.json();
    const integrations = await saveSocialBotIntegration(target.userId, body);
    return NextResponse.json({ ok: true, integrations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save integration." },
      { status: 400 }
    );
  }
}
