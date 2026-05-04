import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { getHostingProvisionByOrderId, updateHostingProvisionAccess } from "@/lib/hosting-db";
import type { HostingProvisionAccess } from "@/lib/hosting-types";

const requestSchema = z.object({
  orderId: z.string().min(1),
  panel: z.enum(["none", "plesk", "cpanel", "directadmin", "custom"]),
  panelLabel: z.string(),
  loginUrl: z.string(),
  username: z.string(),
  isReady: z.boolean(),
  notes: z.string()
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
    const provision = await getHostingProvisionByOrderId(parsed.orderId);

    if (!provision || provision.userId !== target.userId) {
      return NextResponse.json({ error: "Hosting provision not found for this customer." }, { status: 404 });
    }

    const access: HostingProvisionAccess = {
      panel: parsed.panel,
      panelLabel: parsed.panelLabel.trim() || null,
      loginUrl: parsed.loginUrl.trim() || null,
      username: parsed.username.trim() || null,
      isReady: parsed.isReady,
      notes: parsed.notes.trim() || null
    };

    const updated = await updateHostingProvisionAccess(parsed.orderId, access);
    return NextResponse.json({ ok: true, provision: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update hosting access." },
      { status: 400 }
    );
  }
}
