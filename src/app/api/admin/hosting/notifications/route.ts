import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { sendServiceExpiringEmail, sendServiceSuspendedEmail } from "@/lib/email";
import { getHostingProvisionByOrderId } from "@/lib/hosting-db";

const requestSchema = z.object({
  orderId: z.string().min(1),
  type: z.enum(["serviceExpiring", "serviceSuspended"]),
  reason: z.string().optional().default("")
});

export async function POST(request: Request) {
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

    if (parsed.type === "serviceExpiring") {
      await sendServiceExpiringEmail({
        email: provision.customerEmail,
        customerName: provision.customerName,
        serviceName: "Magnetic VPS Hosting",
        tierName: provision.tierName,
        reference: provision.orderId
      });
    } else {
      await sendServiceSuspendedEmail({
        email: provision.customerEmail,
        customerName: provision.customerName,
        serviceName: "Magnetic VPS Hosting",
        tierName: provision.tierName,
        reference: provision.orderId,
        reason: parsed.reason.trim() || null
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send the service lifecycle notification." },
      { status: 400 }
    );
  }
}
