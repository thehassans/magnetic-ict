import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { saveSocialBotIntegration } from "@/lib/social-bot-service";
import type { SocialChannel } from "@/lib/social-bot-types";

export async function DELETE(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  try {
    const { channel } = (await request.json()) as { channel: SocialChannel };
    const integrations = await saveSocialBotIntegration(session.user.id, {
      channel,
      enabled: false,
      label: "",
      pageId: "",
      phoneNumberId: "",
      accountId: "",
      accessToken: "__CLEAR__"
    });
    return NextResponse.json({ ok: true, integrations });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error." }, { status: 400 });
  }
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
    const integrations = await saveSocialBotIntegration(session.user.id, body);
    return NextResponse.json({ ok: true, integrations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save integration." },
      { status: 400 }
    );
  }
}
