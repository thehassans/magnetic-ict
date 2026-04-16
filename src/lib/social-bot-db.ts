import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type {
  SocialBotChunk,
  SocialBotDocument,
  SocialBotIntegration,
  SocialBotMessage,
  SocialBotProfile,
  SocialBotThread
} from "@/lib/social-bot-types";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type MongoFindResponse<T> = {
  cursor?: {
    firstBatch?: T[];
  };
};

function getMongoClient() {
  return prisma as unknown as {
    $runCommandRaw: (command: Record<string, unknown>) => Promise<unknown>;
  };
}

async function runMongoCommand<T>(command: Record<string, unknown>) {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL must be configured.");
  }

  return (await getMongoClient().$runCommandRaw(command)) as T;
}

export async function findMongoDocuments<T>(
  collection: string,
  filter: Record<string, unknown>,
  options?: { sort?: Record<string, 1 | -1>; limit?: number }
) {
  const result = await runMongoCommand<MongoFindResponse<T>>({
    find: collection,
    filter,
    ...(options?.sort ? { sort: options.sort } : {}),
    ...(options?.limit ? { limit: options.limit } : {})
  });

  return result.cursor?.firstBatch ?? [];
}

export async function findOneMongoDocument<T>(collection: string, filter: Record<string, unknown>) {
  const [document] = await findMongoDocuments<T>(collection, filter, { limit: 1 });
  return document ?? null;
}

export async function insertMongoDocument<T extends { _id: string }>(collection: string, document: T) {
  await runMongoCommand({
    insert: collection,
    documents: [document]
  });

  return document;
}

export async function insertManyMongoDocuments<T extends { _id: string }>(collection: string, documents: T[]) {
  if (documents.length === 0) {
    return;
  }

  await runMongoCommand({
    insert: collection,
    documents
  });
}

export async function upsertMongoDocument(
  collection: string,
  filter: Record<string, unknown>,
  set: Record<string, unknown>,
  setOnInsert?: Record<string, unknown>
) {
  await runMongoCommand({
    update: collection,
    updates: [
      {
        q: filter,
        u: {
          $set: set,
          ...(setOnInsert ? { $setOnInsert: setOnInsert } : {})
        },
        upsert: true,
        multi: false
      }
    ]
  });
}

export async function deleteMongoDocuments(collection: string, filter: Record<string, unknown>) {
  await runMongoCommand({
    delete: collection,
    deletes: [
      {
        q: filter,
        limit: 0
      }
    ]
  });
}

export function createSocialBotId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export const socialBotCollections = {
  access: "SocialBotAccessGrants",
  profiles: "SocialBotProfiles",
  documents: "SocialBotDocuments",
  chunks: "SocialBotChunks",
  integrations: "SocialBotIntegrations",
  threads: "SocialBotThreads",
  messages: "SocialBotMessages"
} as const;

export async function getSocialBotProfile(userId: string) {
  return findOneMongoDocument<SocialBotProfile>(socialBotCollections.profiles, { userId });
}

export async function getSocialBotDocuments(userId: string) {
  return findMongoDocuments<SocialBotDocument>(socialBotCollections.documents, { userId }, { sort: { createdAt: -1 } });
}

export async function getSocialBotChunks(userId: string) {
  return findMongoDocuments<SocialBotChunk>(socialBotCollections.chunks, { userId });
}

export async function getSocialBotIntegrations(userId: string) {
  return findMongoDocuments<SocialBotIntegration>(socialBotCollections.integrations, { userId }, { sort: { updatedAt: -1 } });
}

export async function getSocialBotThreads(userId: string) {
  return findMongoDocuments<SocialBotThread>(socialBotCollections.threads, { userId }, { sort: { lastMessageAt: -1 }, limit: 100 });
}

export async function getSocialBotThreadById(userId: string, threadId: string) {
  return findOneMongoDocument<SocialBotThread>(socialBotCollections.threads, { userId, _id: threadId });
}

export async function getSocialBotThreadByExternalId(userId: string, source: string, externalThreadId: string) {
  return findOneMongoDocument<SocialBotThread>(socialBotCollections.threads, { userId, source, externalThreadId });
}

export async function getSocialBotMessages(userId: string, threadId: string) {
  return findMongoDocuments<SocialBotMessage>(socialBotCollections.messages, { userId, threadId }, { sort: { timestamp: 1 }, limit: 200 });
}
