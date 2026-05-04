import { prisma } from "@/lib/prisma";

export async function userHasMagneticVpsAccess(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: {
        in: ["PAID", "FULFILLED"]
      }
    },
    include: {
      serviceTier: {
        include: {
          service: {
            select: {
              catalogKey: true
            }
          }
        }
      }
    }
  });

  return orders.some((order) => order.serviceTier?.service.catalogKey === "magneticVpsHosting");
}
