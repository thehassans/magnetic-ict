import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getManagedDomainById } from "@/lib/domain-management-db";
import { assignMagneticCommerceDomain, ensureMagneticCommerceInstallationForOrder } from "@/lib/magnetic-commerce-access";
import { upsertMagneticCommerceInstallation } from "@/lib/magnetic-commerce-db";

const payloadSchema = z.object({
  domainId: z.string().min(1),
  businessName: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  adminEmail: z.string().email().optional().or(z.literal("")),
  storeCurrency: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid configuration data." }, { status: 400 });
    }

    const installation = await ensureMagneticCommerceInstallationForOrder(orderId);

    if (!installation || installation.userId !== session.user.id) {
      return NextResponse.json({ error: "Magnetic Commerce installation not found." }, { status: 404 });
    }

    const domain = await getManagedDomainById(session.user.id, parsed.data.domainId);

    if (!domain || domain.status !== "active") {
      return NextResponse.json({ error: "Select an active managed domain to continue." }, { status: 400 });
    }

    const updated = await assignMagneticCommerceDomain({
      orderId,
      userId: session.user.id,
      domainId: domain._id,
      domainName: domain.domain
    });

    if (!updated) {
      return NextResponse.json({ error: "Unable to assign Magnetic Commerce to that domain." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const configUpdated = await upsertMagneticCommerceInstallation({
      ...updated,
      businessName: parsed.data.businessName || null,
      logoUrl: parsed.data.logoUrl || null,
      primaryColor: parsed.data.primaryColor || null,
      adminEmail: parsed.data.adminEmail || null,
      storeCurrency: parsed.data.storeCurrency || "USD",
      notes: parsed.data.notes || null,
      updatedAt: now
    });

    return NextResponse.json({ ok: true, installation: configUpdated });
  } catch (error) {
    console.error("Magnetic Commerce domain assignment failed", error);
    return NextResponse.json({ error: "Unable to save the selected domain right now." }, { status: 500 });
  }
}
