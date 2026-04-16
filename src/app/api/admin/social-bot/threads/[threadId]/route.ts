import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { getThreadWithMessages, setThreadMode } from "@/lib/social-bot-service";

const requestSchema = z.object({
  mode: z.enum(["AI", "MANUAL"])
});

export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  const { threadId } = await params;
  const payload = await getThreadWithMessages(target.userId, threadId);

  if (!payload.thread) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const { threadId } = await params;
    const thread = await setThreadMode(target.userId, threadId, parsed.mode);

    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, thread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update thread mode." },
      { status: 400 }
    );
  }
}
