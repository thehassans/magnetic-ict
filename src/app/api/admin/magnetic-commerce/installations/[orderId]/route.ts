import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyMagneticCommerceDnsTemplate, updateMagneticCommerceInstallationManagement } from "@/lib/magnetic-commerce-access";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update-management"),
    status: z.enum(["pending_domain_assignment", "integration_requested", "active", "failed"]),
    errorMessage: z.string(),
    storefrontUrl: z.string(),
    adminUrl: z.string(),
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
    action: z.literal("apply-dns"),
    userId: z.string().min(1)
  })
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { orderId } = await params;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid Magnetic Commerce management details." }, { status: 400 });
    }

    if (parsed.data.action === "apply-dns") {
      const updated = await applyMagneticCommerceDnsTemplate({
        orderId,
        userId: parsed.data.userId
      });

      return NextResponse.json({ ok: true, installation: updated });
    }

    const updated = await updateMagneticCommerceInstallationManagement({
      orderId,
      status: parsed.data.status,
      errorMessage: parsed.data.errorMessage || null,
      storefrontUrl: parsed.data.storefrontUrl || null,
      adminUrl: parsed.data.adminUrl || null,
      configuration: parsed.data.configuration
    });

    if (!updated) {
      return NextResponse.json({ error: "Magnetic Commerce installation not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, installation: updated });
  } catch (error) {
    console.error("Admin Magnetic Commerce update failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update Magnetic Commerce right now." },
      { status: 500 }
    );
  }
}
