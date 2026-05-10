import { getHostingProvisionsForUser } from "@/lib/hosting-db";
import { prisma } from "@/lib/prisma";

export async function userHasMagneticVpsAccess(userId: string) {
  const [orders, provisions] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
        status: { in: ["PAID", "FULFILLED"] }
      },
      include: {
        serviceTier: {
          include: {
            service: { select: { catalogKey: true } }
          }
        }
      }
    }),
    getHostingProvisionsForUser(userId).catch(() => [])
  ]);

  const hasPaidOrder = orders.some((order) => order.serviceTier?.service.catalogKey === "magneticVpsHosting");
  const hasManualProvision = provisions.length > 0;

  return hasPaidOrder || hasManualProvision;
}
