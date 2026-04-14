import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { getThreadWithMessages, setThreadMode } from "@/lib/social-bot-service";

const requestSchema = z.object({
  mode: z.enum(["AI", "MANUAL"])
});

export async function GET(_request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this account." }, { status: 403 });
  }

  const { threadId } = await params;
  const payload = await getThreadWithMessages(session.user.id, threadId);

  if (!payload.thread) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this account." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const { threadId } = await params;
    const thread = await setThreadMode(session.user.id, threadId, parsed.mode);

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
