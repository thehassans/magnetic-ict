import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSocialBotId, deleteMongoDocuments, findOneMongoDocument, socialBotCollections, upsertMongoDocument } from "@/lib/social-bot-db";

type SocialBotAccessGrant = {
  _id: string;
  userId: string;
  assignedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export async function getRequiredUserSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export async function userHasMagneticSocialBotAccess(userId: string) {
  const manualGrant = await findOneMongoDocument<SocialBotAccessGrant>(socialBotCollections.access, { userId });

  if (manualGrant) {
    return true;
  }

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

  if (orders.some((order) => order.serviceTier.service.catalogKey === "magneticSocialBot")) {
    return true;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });

  if (user?.email) {
    const normalizedEmail = user.email.toLowerCase();
    const acceptedInvite = await findOneMongoDocument<{ status: string }>(
      socialBotCollections.invitations,
      { inviteeEmail: normalizedEmail, status: "accepted" }
    );
    if (acceptedInvite) {
      return true;
    }
  }

  return false;
}

export async function getManualSocialBotAccessGrant(userId: string) {
  return findOneMongoDocument<SocialBotAccessGrant>(socialBotCollections.access, { userId });
}

export type SocialBotSubscriptionInfo = {
  hasAccess: boolean;
  planName: string;
  planType: "ORDER" | "MANUAL" | "NONE";
  startDate: string | null;
  expiryDate: string | null;
};

export async function getSocialBotSubscriptionInfo(userId: string): Promise<SocialBotSubscriptionInfo> {
  const manualGrant = await findOneMongoDocument<SocialBotAccessGrant>(socialBotCollections.access, { userId });
  if (manualGrant) {
    return { hasAccess: true, planName: "Professional", planType: "MANUAL", startDate: manualGrant.createdAt, expiryDate: null };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user?.email) {
    const normalizedEmail = user.email.toLowerCase();
    const acceptedInvite = await findOneMongoDocument<{ acceptedAt?: string; createdAt: string }>(socialBotCollections.invitations, { inviteeEmail: normalizedEmail, status: "accepted" });
    if (acceptedInvite) {
      return { hasAccess: true, planName: "Team Member", planType: "MANUAL", startDate: acceptedInvite.acceptedAt ?? acceptedInvite.createdAt, expiryDate: null };
    }
  }

  const orders = await prisma.order.findMany({
    where: { userId, status: { in: ["PAID", "FULFILLED"] } },
    include: { serviceTier: { select: { name: true, service: { select: { catalogKey: true } } } } },
    orderBy: { createdAt: "desc" }
  });

  const order = orders.find((o) => o.serviceTier.service.catalogKey === "magneticSocialBot");
  if (!order) {
    return { hasAccess: false, planName: "None", planType: "NONE", startDate: null, expiryDate: null };
  }

  return {
    hasAccess: true,
    planName: order.serviceTier.name ?? "Professional",
    planType: "ORDER",
    startDate: order.createdAt.toISOString(),
    expiryDate: null
  };
}

export async function setManualSocialBotAccess(userId: string, assignedByUserId: string, enabled: boolean) {
  if (!enabled) {
    await deleteMongoDocuments(socialBotCollections.access, { userId });
    return null;
  }

  const current = await getManualSocialBotAccessGrant(userId);
  const now = new Date().toISOString();

  await upsertMongoDocument(
    socialBotCollections.access,
    { userId },
    {
      assignedByUserId,
      updatedAt: now
    },
    {
      _id: current?._id ?? createSocialBotId("sba"),
      userId,
      assignedByUserId,
      createdAt: current?.createdAt ?? now
    }
  );

  return getManualSocialBotAccessGrant(userId);
}
