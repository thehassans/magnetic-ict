import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { createDemoThread } from "@/lib/social-bot-service";
import { getSocialBotThreads } from "@/lib/social-bot-db";

export async function GET() {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const workspace = await getWorkspaceContext(session.user.id);
  const threads = await getSocialBotThreads(workspace.ownerId);
  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
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
    const payload = await createDemoThread(workspace.ownerId, body);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create thread." },
      { status: 400 }
    );
  }
}
