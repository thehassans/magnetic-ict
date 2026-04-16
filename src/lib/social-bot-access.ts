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

  return orders.some((order) => order.serviceTier.service.catalogKey === "magneticSocialBot");
}

export async function getManualSocialBotAccessGrant(userId: string) {
  return findOneMongoDocument<SocialBotAccessGrant>(socialBotCollections.access, { userId });
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
