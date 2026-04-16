import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type AdminSocialBotCustomer = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  orderCount: number;
};

export async function getAdminSocialBotCustomers(): Promise<AdminSocialBotCustomer[]> {
  if (!hasDatabase) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      orders: {
        some: {
          status: {
            in: ["PAID", "FULFILLED"]
          },
          serviceTier: {
            service: {
              catalogKey: "magneticSocialBot"
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          orders: true
        }
      }
    }
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    orderCount: user._count.orders
  }));
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
    select: { id: true }
  });

  if (!user) {
    return {
      response: NextResponse.json({ error: "Customer not found." }, { status: 404 }),
      userId: null as string | null
    };
  }

  const hasAccess = await userHasMagneticSocialBotAccess(userId);

  if (!hasAccess) {
    return {
      response: NextResponse.json({ error: "Magnetic Social Bot is not unlocked for this customer." }, { status: 403 }),
      userId: null as string | null
    };
  }

  return {
    response: null as NextResponse | null,
    userId
  };
}
