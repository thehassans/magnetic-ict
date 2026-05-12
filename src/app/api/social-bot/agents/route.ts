import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createSocialBotAgent,
  createSocialBotId,
  deleteSocialBotAgent,
  getSocialBotAgentById,
  getSocialBotAgents,
  updateSocialBotAgent
} from "@/lib/social-bot-db";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { socialChannels } from "@/lib/social-bot-types";

export const runtime = "nodejs";

const agentSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).default(""),
  instructions: z.string().max(4000).default(""),
  avatarDataUrl: z.string().max(200000).default(""),
  channels: z.array(z.enum(socialChannels)).default([]),
  documentIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

async function requireAccess() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await requireAccess();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const agents = await getSocialBotAgents(userId);
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  const userId = await requireAccess();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = agentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid agent data." }, { status: 400 });

  const now = new Date().toISOString();
  const agent = await createSocialBotAgent({
    _id: createSocialBotId("agent"),
    userId,
    ...parsed.data,
    createdAt: now,
    updatedAt: now
  });

  return NextResponse.json(agent, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await requireAccess();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const { agentId, ...updates } = body;

  if (typeof agentId !== "string") return NextResponse.json({ error: "agentId required." }, { status: 400 });

  const existing = await getSocialBotAgentById(userId, agentId);
  if (!existing) return NextResponse.json({ error: "Agent not found." }, { status: 404 });

  const parsed = agentSchema.partial().safeParse(updates);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update data." }, { status: 400 });

  await updateSocialBotAgent(userId, agentId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await requireAccess();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const { agentId } = body;

  if (typeof agentId !== "string") return NextResponse.json({ error: "agentId required." }, { status: 400 });

  await deleteSocialBotAgent(userId, agentId);
  return NextResponse.json({ ok: true });
}
