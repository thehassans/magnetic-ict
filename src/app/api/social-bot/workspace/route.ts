import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { getSocialBotWorkspace, saveSocialBotProfile } from "@/lib/social-bot-service";

export async function GET() {
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this account." }, { status: 403 });
  }

  const workspace = await getSocialBotWorkspace(session.user.id);
  return NextResponse.json(workspace);
}

export async function PATCH(request: Request) {
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
    const profile = await saveSocialBotProfile(session.user.id, body);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save profile." },
      { status: 400 }
    );
  }
}
