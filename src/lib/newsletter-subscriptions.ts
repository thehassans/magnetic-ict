import { randomUUID } from "node:crypto";
import { findMongoDocuments, findOneMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type NewsletterSubscriptionStatus = "active" | "unsubscribed";
export type NewsletterSubscriptionSource = "footer" | "admin" | "api";

export type NewsletterSubscriptionRecord = {
  _id: string;
  userId: string | null;
  email: string;
  name: string | null;
  status: NewsletterSubscriptionStatus;
  source: NewsletterSubscriptionSource;
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const newsletterCollections = {
  subscriptions: "NewsletterSubscriptions"
} as const;

export function createNewsletterSubscriptionId() {
  return `newsletter_${randomUUID()}`;
}

export async function getNewsletterSubscriptionByEmail(email: string) {
  if (!hasDatabase) {
    return null as NewsletterSubscriptionRecord | null;
  }

  return findOneMongoDocument<NewsletterSubscriptionRecord>(newsletterCollections.subscriptions, {
    email: email.trim().toLowerCase()
  });
}

export async function getNewsletterSubscriptions(limit = 200) {
  if (!hasDatabase) {
    return [] as NewsletterSubscriptionRecord[];
  }

  return findMongoDocuments<NewsletterSubscriptionRecord>(newsletterCollections.subscriptions, {}, { sort: { updatedAt: -1 }, limit });
}

export async function subscribeToNewsletter(args: {
  email: string;
  userId?: string | null;
  name?: string | null;
  source?: NewsletterSubscriptionSource;
}) {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL must be configured to store newsletter subscriptions.");
  }

  const normalizedEmail = args.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const existing = await getNewsletterSubscriptionByEmail(normalizedEmail);

  const record: NewsletterSubscriptionRecord = {
    _id: existing?._id ?? createNewsletterSubscriptionId(),
    userId: args.userId ?? existing?.userId ?? null,
    email: normalizedEmail,
    name: args.name?.trim() || existing?.name || null,
    status: "active",
    source: args.source ?? existing?.source ?? "api",
    subscribedAt: existing?.subscribedAt ?? now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  await upsertMongoDocument(
    newsletterCollections.subscriptions,
    { email: normalizedEmail },
    {
      userId: record.userId,
      email: record.email,
      name: record.name,
      status: record.status,
      source: record.source,
      subscribedAt: record.subscribedAt,
      updatedAt: record.updatedAt
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}
