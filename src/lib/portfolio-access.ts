import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export async function userHasPortfolioAccess(userId: string): Promise<boolean> {
  if (!hasDatabase) return false;

  const orders = await prisma.order.findMany({
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
  });

  return orders.some((o) => o.serviceTier.service.catalogKey === "magneticPortfolioBuilder");
}
