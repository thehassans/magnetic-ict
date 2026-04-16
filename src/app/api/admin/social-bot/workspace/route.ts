import { NextResponse } from "next/server";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { getSocialBotWorkspace, saveSocialBotProfile } from "@/lib/social-bot-service";

export async function GET(request: Request) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  const workspace = await getSocialBotWorkspace(target.userId);
  return NextResponse.json(workspace);
}

export async function PATCH(request: Request) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const body = await request.json();
    const profile = await saveSocialBotProfile(target.userId, body);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save profile." },
      { status: 400 }
    );
  }
}
