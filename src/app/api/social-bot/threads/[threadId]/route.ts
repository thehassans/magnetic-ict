import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { assignAgentToThread, autoAssignAgent, deleteThread, getThreadWithMessages, setThreadAutoAssign, setThreadMode } from "@/lib/social-bot-service";

const requestSchema = z.object({
  mode: z.enum(["AI", "MANUAL"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
  autoAssign: z.boolean().optional()
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

  const workspace = await getWorkspaceContext(session.user.id);

  const { threadId } = await params;
  const payload = await getThreadWithMessages(workspace.ownerId, threadId);

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

  const workspace = await getWorkspaceContext(session.user.id);

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const { threadId } = await params;
    const userId = workspace.ownerId;

    let thread;
    if (parsed.autoAssign === true) {
      thread = await autoAssignAgent(userId, threadId);
    } else if (parsed.autoAssign === false) {
      thread = await setThreadAutoAssign(userId, threadId, false);
    } else if (parsed.assignedAgentId !== undefined) {
      thread = await assignAgentToThread(userId, threadId, parsed.assignedAgentId);
    } else if (parsed.mode) {
      thread = await setThreadMode(userId, threadId, parsed.mode);
    }

    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, thread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update thread." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const workspace = await getWorkspaceContext(session.user.id);
  const { threadId } = await params;
  await deleteThread(workspace.ownerId, threadId);
  return NextResponse.json({ ok: true });
}
