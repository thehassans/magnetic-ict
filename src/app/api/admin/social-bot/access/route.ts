import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { setManualSocialBotAccess } from "@/lib/social-bot-access";

const requestSchema = z.object({
  enabled: z.boolean()
});

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN" || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const target = await requireAdminSocialBotTarget(request);

  if (target.response || !target.userId) {
    return target.response as NextResponse;
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const grant = await setManualSocialBotAccess(target.userId, session.user.id, parsed.enabled);
    return NextResponse.json({ ok: true, grant });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update access." },
      { status: 400 }
    );
  }
}
