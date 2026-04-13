import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const tierSchema = z.object({
  catalogKey: z.string().min(1),
  name: z.enum(["Starter", "Professional", "Enterprise"]),
  price: z.number().nonnegative()
});

const requestSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  imageLabel: z.string().min(2),
  tiers: z.array(tierSchema).min(1)
});

type EditableTier = z.infer<typeof tierSchema>;

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
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid service data." }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { catalogKey: serviceId },
      include: {
        tiers: {
          select: {
            id: true,
            catalogKey: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    await prisma.service.update({
      where: { id: service.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        image: parsed.data.imageLabel
      }
    });

    const tierIdByCatalogKey = new Map(service.tiers.map((tier: { id: string; catalogKey: string }) => [tier.catalogKey, tier.id]));

    await prisma.$transaction(
      parsed.data.tiers
        .filter((tier: EditableTier) => tierIdByCatalogKey.has(tier.catalogKey))
        .map((tier: EditableTier) =>
          prisma.serviceTier.update({
            where: { id: tierIdByCatalogKey.get(tier.catalogKey) },
            data: {
              name: tier.name,
              price: tier.price
            }
          })
        )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Service update failed", error);
    return NextResponse.json({ error: "Unable to update this service right now." }, { status: 500 });
  }
}
