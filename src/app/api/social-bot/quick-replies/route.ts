import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import {
  createSocialBotId,
  createSocialBotQuickReply,
  deleteSocialBotQuickReply,
  getSocialBotQuickReplies
} from "@/lib/social-bot-db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);

  const quickReplies = await getSocialBotQuickReplies(workspace.ownerId);
  return NextResponse.json({ quickReplies });
}

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);

  try {
    const { title, shortcut, body } = (await request.json()) as {
      title?: string;
      shortcut?: string;
      body?: string;
    };

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const quickReply = await createSocialBotQuickReply({
      _id: createSocialBotId("sbqr"),
      userId: workspace.ownerId,
      title: title.trim(),
      shortcut: (shortcut ?? "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, ""),
      body: body.trim(),
      createdAt: now,
      updatedAt: now
    });

    const quickReplies = await getSocialBotQuickReplies(workspace.ownerId);
    return NextResponse.json({ ok: true, quickReply, quickReplies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save quick reply." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    await deleteSocialBotQuickReply(workspace.ownerId, id);
    const quickReplies = await getSocialBotQuickReplies(workspace.ownerId);
    return NextResponse.json({ ok: true, quickReplies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete quick reply." },
      { status: 500 }
    );
  }
}
