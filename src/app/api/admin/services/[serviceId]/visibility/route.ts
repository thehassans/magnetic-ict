import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { serviceCatalog } from "@/lib/service-catalog";
import { updateServiceVisibility } from "@/lib/service-visibility";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const visibilitySchema = z.object({
  enabled: z.boolean().optional(),
  deleted: z.boolean().optional()
}).refine((value) => value.enabled !== undefined || value.deleted !== undefined, {
  message: "Provide at least one visibility change."
});

export async function PATCH(request: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured before editing services." }, { status: 503 });
  }

  try {
    const [{ serviceId }, body] = await Promise.all([params, request.json()]);
    const parsed = visibilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid service status change." }, { status: 400 });
    }

    if (!serviceCatalog.some((service) => service.id === serviceId)) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const state = await updateServiceVisibility(serviceId as (typeof serviceCatalog)[number]["id"], parsed.data);

    return NextResponse.json({
      ok: true,
      state,
      message: state.deleted ? "Service removed from the storefront." : state.enabled ? "Service is live on the storefront." : "Service hidden from the storefront."
    });
  } catch (error) {
    console.error("Service visibility update failed", error);
    return NextResponse.json({ error: "Unable to update this service right now." }, { status: 500 });
  }
}
