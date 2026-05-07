import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getManagedDomainById } from "@/lib/domain-management-db";
import {
  applyMagneticCommerceDnsTemplate,
  assignMagneticCommerceDomain,
  ensureMagneticCommerceInstallationForOrder,
  updateMagneticCommerceInstallationConfiguration
} from "@/lib/magnetic-commerce-access";

const payloadSchema = z.object({
  domainId: z.string().min(1)
});

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update-config"),
    configuration: z.object({
      businessName: z.string().min(1),
      brandColor: z.string().min(1),
      adminEmail: z.string().email(),
      supportEmail: z.string().email(),
      currency: z.string().min(3).max(8),
      logoUrl: z.string(),
      launchNotes: z.string()
    })
  }),
  z.object({
    action: z.literal("apply-dns")
  })
]);

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
      return NextResponse.json({ error: "Please select a valid domain." }, { status: 400 });
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

    return NextResponse.json({ ok: true, installation: updated });
  } catch (error) {
    console.error("Magnetic Commerce domain assignment failed", error);
    return NextResponse.json({ error: "Unable to save the selected domain right now." }, { status: 500 });
  }
}

export async function PATCH(
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
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid Magnetic Commerce details." }, { status: 400 });
    }

    const installation = await ensureMagneticCommerceInstallationForOrder(orderId);

    if (!installation || installation.userId !== session.user.id) {
      return NextResponse.json({ error: "Magnetic Commerce installation not found." }, { status: 404 });
    }

    if (parsed.data.action === "apply-dns") {
      const updated = await applyMagneticCommerceDnsTemplate({
        orderId,
        userId: session.user.id
      });

      return NextResponse.json({ ok: true, installation: updated });
    }

    const updated = await updateMagneticCommerceInstallationConfiguration({
      orderId,
      userId: session.user.id,
      configuration: parsed.data.configuration
    });

    if (!updated) {
      return NextResponse.json({ error: "Unable to update Magnetic Commerce details right now." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, installation: updated });
  } catch (error) {
    console.error("Magnetic Commerce workspace update failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update Magnetic Commerce right now." },
      { status: 500 }
    );
  }
}
