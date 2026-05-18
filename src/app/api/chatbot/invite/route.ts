import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import {
  createChatbotInvitation,
  deleteChatbotInvitation,
  getChatbotInvitations
} from "@/lib/social-bot-db";
import { sendInviteEmail } from "@/lib/invite-email";
import type { ChatbotInvitation } from "@/lib/social-bot-types";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const invites = await getChatbotInvitations(session.user.id);
  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { email } = (await request.json()) as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const existing = await getChatbotInvitations(session.user.id);
  const alreadySent = existing.find(
    (i) => i.inviteeEmail.toLowerCase() === email.toLowerCase() && i.status === "pending"
  );
  if (alreadySent) {
    return NextResponse.json({ error: "An invite has already been sent to this address." }, { status: 409 });
  }

  const token = randomUUID().replace(/-/g, "");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const invitation: ChatbotInvitation = {
    _id: `inv_${randomUUID()}`,
    token,
    inviterUserId: session.user.id,
    inviterName: session.user.name ?? session.user.email ?? "A team member",
    inviterEmail: session.user.email ?? "",
    inviteeEmail: email,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  await createChatbotInvitation(invitation);

  try {
    await sendInviteEmail({
      inviterName: invitation.inviterName,
      inviteeEmail: email,
      token
    });
  } catch {
    // non-fatal: invite is saved, email may fail if provider not configured
  }

  return NextResponse.json({ ok: true, invitation });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { token } = (await request.json()) as { token?: string };
  if (!token) return NextResponse.json({ error: "token required." }, { status: 400 });

  await deleteChatbotInvitation(session.user.id, token);
  return NextResponse.json({ ok: true });
}
