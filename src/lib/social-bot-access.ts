import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getRequiredUserSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export async function userHasMagneticSocialBotAccess(userId: string) {
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

  return orders.some((order) => order.serviceTier.service.catalogKey === "magneticSocialBot");
}
