import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getManualSocialBotAccessGrant } from "@/lib/social-bot-access";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type AdminSocialBotCustomer = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  orderCount: number;
  hasPurchasedAccess: boolean;
  hasManualAccess: boolean;
  hasAccess: boolean;
};

export async function getAdminSocialBotCustomers(): Promise<AdminSocialBotCustomer[]> {
  if (!hasDatabase) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      role: "USER"
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      orders: {
        where: {
          status: {
            in: ["PAID", "FULFILLED"]
          },
          serviceTier: {
            service: {
              catalogKey: "magneticSocialBot"
            }
          }
        },
        select: {
          id: true
        }
      },
      _count: {
        select: {
          orders: true
        }
      }
    }
  });

  const grants = await Promise.all(users.map((user) => getManualSocialBotAccessGrant(user.id)));

  return users.map((user, index) => {
    const hasPurchasedAccess = user.orders.length > 0;
    const hasManualAccess = Boolean(grants[index]);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      orderCount: user._count.orders,
      hasPurchasedAccess,
      hasManualAccess,
      hasAccess: hasPurchasedAccess || hasManualAccess
    };
  });
}

export async function requireAdminSocialBotTarget(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      userId: null as string | null
    };
  }

  if (!hasDatabase) {
    return {
      response: NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 }),
      userId: null as string | null
    };
  }

  const userId = new URL(request.url).searchParams.get("userId")?.trim() ?? "";

  if (!userId) {
    return {
      response: NextResponse.json({ error: "Select a customer first." }, { status: 400 }),
      userId: null as string | null
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });

  if (!user || user.role !== "USER") {
    return {
      response: NextResponse.json({ error: "Customer not found." }, { status: 404 }),
      userId: null as string | null
    };
  }

  return {
    response: null as NextResponse | null,
    userId
  };
}
