import { NextResponse } from "next/server";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { sendAgentMessage } from "@/lib/social-bot-service";

export async function POST(request: Request) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const body = await request.json();
    const payload = await sendAgentMessage(target.userId, body);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 400 }
    );
  }
}
