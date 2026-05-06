import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSocialBotTarget } from "@/lib/admin-social-bot";
import { getHostingProvisionByOrderId, updateHostingProvisionManagement } from "@/lib/hosting-db";

const requestSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["pending", "contract_created", "admin_created", "datacenter_created", "server_created", "volume_attached", "provisioned", "failed"]),
  errorMessage: z.string(),
  provisionedAt: z.string().nullable(),
  reseller: z.object({
    contractId: z.string(),
    adminId: z.string()
  }),
  cloud: z.object({
    datacenterId: z.string(),
    serverId: z.string(),
    volumeId: z.string(),
    location: z.string()
  })
});

export async function PATCH(request: Request) {
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

    const updated = await updateHostingProvisionManagement(parsed.orderId, {
      status: parsed.status,
      errorMessage: parsed.errorMessage.trim() || null,
      provisionedAt: parsed.provisionedAt,
      reseller: {
        contractId: parsed.reseller.contractId.trim() || null,
        adminId: parsed.reseller.adminId.trim() || null
      },
      cloud: {
        datacenterId: parsed.cloud.datacenterId.trim() || null,
        serverId: parsed.cloud.serverId.trim() || null,
        volumeId: parsed.cloud.volumeId.trim() || null,
        location: parsed.cloud.location.trim() || null
      }
    });

    return NextResponse.json({ ok: true, provision: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update hosting provision management." },
      { status: 400 }
    );
  }
}
