import { z } from "zod";
import {
  createSocialBotId,
  getSocialBotChunks,
  getSocialBotDocuments,
  getSocialBotIntegrations,
  getSocialBotMessages,
  getSocialBotProfile,
  getSocialBotThreadByExternalId,
  getSocialBotThreadById,
  getSocialBotThreads,
  insertManyMongoDocuments,
  insertMongoDocument,
  socialBotCollections,
  upsertMongoDocument
} from "@/lib/social-bot-db";
import { buildKnowledgeChunks, encryptSecret, generateSocialReply, sendMetaReply } from "@/lib/social-bot-rag";
import type {
  SocialBotDocument,
  SocialBotIntegration,
  SocialBotMessage,
  SocialBotThread,
  SocialBotWorkspace,
  SocialChannel,
  SocialThreadMode
} from "@/lib/social-bot-types";
import { socialChannels } from "@/lib/social-bot-types";

const profileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(2).max(120)
});

const integrationSchema = z.object({
  channel: z.enum(socialChannels),
  enabled: z.boolean(),
  label: z.string().trim().max(80).default(""),
  pageId: z.string().trim().max(120).default(""),
  phoneNumberId: z.string().trim().max(120).default(""),
  accountId: z.string().trim().max(120).default(""),
  accessToken: z.string().trim().default("")
});

const demoThreadSchema = z.object({
  source: z.enum(socialChannels),
  contactName: z.string().trim().min(1).max(80),
  contactHandle: z.string().trim().min(1).max(120),
  firstMessage: z.string().trim().min(1).max(4000)
});

const outboundMessageSchema = z.object({
  threadId: z.string().min(1),
  text: z.string().trim().min(1).max(4000)
});

async function ensureDefaultIntegrations(userId: string) {
  const existing = await getSocialBotIntegrations(userId);
  const existingChannels = new Set(existing.map((integration) => integration.channel));
  const now = new Date().toISOString();

  const defaults = socialChannels
    .filter((channel) => !existingChannels.has(channel))
    .map((channel) => ({
      _id: createSocialBotId("sbi"),
      userId,
      channel,
      enabled: false,
      status: "DISCONNECTED" as const,
      label: channel,
      pageId: "",
      phoneNumberId: "",
      accountId: "",
      accessTokenEncrypted: "",
      createdAt: now,
      updatedAt: now,
      connectedAt: null
    }));

  await insertManyMongoDocuments(socialBotCollections.integrations, defaults);
  const integrations = defaults.length > 0 ? await getSocialBotIntegrations(userId) : existing;

  return socialChannels.map((channel) => integrations.find((integration) => integration.channel === channel)).filter(Boolean) as SocialBotIntegration[];
}

export async function getSocialBotWorkspace(userId: string): Promise<SocialBotWorkspace> {
  const [profile, documents, threads, integrations] = await Promise.all([
    getSocialBotProfile(userId),
    getSocialBotDocuments(userId),
    getSocialBotThreads(userId),
    ensureDefaultIntegrations(userId)
  ]);

  return {
    profile,
    documents,
    integrations,
    threads
  };
}

export async function saveSocialBotProfile(userId: string, input: unknown) {
  const payload = profileSchema.parse(input);
  const current = await getSocialBotProfile(userId);
  const now = new Date().toISOString();

  await upsertMongoDocument(
    socialBotCollections.profiles,
    { userId },
    {
      businessName: payload.businessName,
      industry: payload.industry,
      onboardingStep: 2,
      knowledgeBaseReady: current?.knowledgeBaseReady ?? false,
      updatedAt: now
    },
    {
      _id: current?._id ?? createSocialBotId("sbp"),
      userId,
      createdAt: current?.createdAt ?? now
    }
  );

  return getSocialBotProfile(userId);
}

export async function saveSocialBotIntegration(userId: string, input: unknown) {
  const payload = integrationSchema.parse(input);
  const current = (await ensureDefaultIntegrations(userId)).find((integration) => integration.channel === payload.channel);
  const now = new Date().toISOString();
  const accessTokenEncrypted = payload.accessToken ? encryptSecret(payload.accessToken) : current?.accessTokenEncrypted ?? "";
  const connected = payload.enabled && Boolean(payload.accessToken || current?.accessTokenEncrypted);

  await upsertMongoDocument(
    socialBotCollections.integrations,
    { userId, channel: payload.channel },
    {
      enabled: payload.enabled,
      status: connected ? "CONNECTED" : payload.enabled ? "PENDING" : "DISCONNECTED",
      label: payload.label || payload.channel,
      pageId: payload.pageId,
      phoneNumberId: payload.phoneNumberId,
      accountId: payload.accountId,
      accessTokenEncrypted,
      updatedAt: now,
      connectedAt: connected ? now : null
    },
    {
      _id: current?._id ?? createSocialBotId("sbi"),
      userId,
      channel: payload.channel,
      createdAt: current?.createdAt ?? now
    }
  );

  if (connected) {
    await upsertMongoDocument(
      socialBotCollections.profiles,
      { userId },
      {
        onboardingStep: 3,
        updatedAt: now
      },
      {
        _id: createSocialBotId("sbp"),
        userId,
        businessName: "",
        industry: "",
        knowledgeBaseReady: false,
        createdAt: now
      }
    );
  }

  return ensureDefaultIntegrations(userId);
}

export async function addKnowledgeDocument({
  userId,
  fileName,
  mimeType,
  text
}: {
  userId: string;
  fileName: string;
  mimeType: string;
  text: string;
}) {
  const now = new Date().toISOString();
  const preview = text.replace(/\s+/g, " ").trim().slice(0, 240);
  const documentId = createSocialBotId("sbd");

  const document: SocialBotDocument = {
    _id: documentId,
    userId,
    fileName,
    mimeType,
    status: "PROCESSING",
    chunkCount: 0,
    textPreview: preview,
    createdAt: now,
    updatedAt: now
  };

  await insertMongoDocument(socialBotCollections.documents, document);

  try {
    const chunks = await buildKnowledgeChunks({ userId, documentId, fileName, text });
    await insertManyMongoDocuments(socialBotCollections.chunks, chunks);

    await upsertMongoDocument(
      socialBotCollections.documents,
      { _id: documentId, userId },
      {
        status: "READY",
        chunkCount: chunks.length,
        textPreview: preview,
        updatedAt: new Date().toISOString()
      }
    );

    await upsertMongoDocument(
      socialBotCollections.profiles,
      { userId },
      {
        knowledgeBaseReady: true,
        onboardingStep: 2,
        updatedAt: new Date().toISOString()
      },
      {
        _id: createSocialBotId("sbp"),
        userId,
        businessName: "",
        industry: "",
        createdAt: now
      }
    );
  } catch (error) {
    await upsertMongoDocument(
      socialBotCollections.documents,
      { _id: documentId, userId },
      {
        status: "FAILED",
        updatedAt: new Date().toISOString()
      }
    );

    throw error;
  }

  return getSocialBotDocuments(userId);
}

async function saveThread(thread: SocialBotThread) {
  await upsertMongoDocument(
    socialBotCollections.threads,
    { _id: thread._id, userId: thread.userId },
    {
      source: thread.source,
      externalThreadId: thread.externalThreadId,
      contactName: thread.contactName,
      contactHandle: thread.contactHandle,
      mode: thread.mode,
      lastMessagePreview: thread.lastMessagePreview,
      lastMessageAt: thread.lastMessageAt,
      unreadCount: thread.unreadCount,
      updatedAt: thread.updatedAt
    },
    {
      _id: thread._id,
      userId: thread.userId,
      createdAt: thread.createdAt
    }
  );
}

export async function appendMessage(message: SocialBotMessage) {
  await insertMongoDocument(socialBotCollections.messages, message);
  return message;
}

export async function createDemoThread(userId: string, input: unknown) {
  const payload = demoThreadSchema.parse(input);
  const now = new Date().toISOString();
  const threadId = createSocialBotId("sbt");
  const thread: SocialBotThread = {
    _id: threadId,
    userId,
    source: payload.source,
    externalThreadId: `demo_${threadId}`,
    contactName: payload.contactName,
    contactHandle: payload.contactHandle,
    mode: "AI",
    lastMessagePreview: payload.firstMessage,
    lastMessageAt: now,
    unreadCount: 1,
    createdAt: now,
    updatedAt: now
  };

  await saveThread(thread);

  const inbound: SocialBotMessage = {
    _id: createSocialBotId("sbm"),
    userId,
    threadId,
    source: payload.source,
    direction: "INBOUND",
    role: "USER",
    text: payload.firstMessage,
    timestamp: now,
    deliveryStatus: "SENT",
    metadata: { demo: true }
  };

  await appendMessage(inbound);
  await maybeGenerateAiReply(thread);

  return getThreadWithMessages(userId, threadId);
}

export async function getThreadWithMessages(userId: string, threadId: string) {
  const [thread, messages] = await Promise.all([getSocialBotThreadById(userId, threadId), getSocialBotMessages(userId, threadId)]);
  return { thread, messages };
}

export async function setThreadMode(userId: string, threadId: string, mode: SocialThreadMode) {
  const current = await getSocialBotThreadById(userId, threadId);

  if (!current) {
    return null;
  }

  await saveThread({
    ...current,
    mode,
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  });

  return getSocialBotThreadById(userId, threadId);
}

export async function sendAgentMessage(userId: string, input: unknown) {
  const payload = outboundMessageSchema.parse(input);
  const thread = await getSocialBotThreadById(userId, payload.threadId);

  if (!thread) {
    throw new Error("Thread not found.");
  }

  const now = new Date().toISOString();
  const integrations = await ensureDefaultIntegrations(userId);
  const integration = integrations.find((item) => item.channel === thread.source);
  let deliveryStatus: SocialBotMessage["deliveryStatus"] = thread.externalThreadId.startsWith("demo_") ? "SENT" : "PENDING";
  const metadata: Record<string, unknown> = {};

  if (integration?.status === "CONNECTED" && !thread.externalThreadId.startsWith("demo_")) {
    try {
      await sendMetaReply({ integration, thread, messageText: payload.text });
      deliveryStatus = "SENT";
    } catch (error) {
      deliveryStatus = "FAILED";
      metadata.error = error instanceof Error ? error.message : "Send failed.";
    }
  }

  const message: SocialBotMessage = {
    _id: createSocialBotId("sbm"),
    userId,
    threadId: thread._id,
    source: thread.source,
    direction: "OUTBOUND",
    role: "AGENT",
    text: payload.text,
    timestamp: now,
    deliveryStatus,
    metadata
  };

  await appendMessage(message);
  await saveThread({
    ...thread,
    lastMessagePreview: payload.text,
    lastMessageAt: now,
    unreadCount: 0,
    updatedAt: now
  });

  return getThreadWithMessages(userId, thread._id);
}

export async function maybeGenerateAiReply(thread: SocialBotThread) {
  if (thread.mode !== "AI") {
    return null;
  }

  const [profile, chunks, messages, integrations] = await Promise.all([
    getSocialBotProfile(thread.userId),
    getSocialBotChunks(thread.userId),
    getSocialBotMessages(thread.userId, thread._id),
    ensureDefaultIntegrations(thread.userId)
  ]);

  const latestInbound = [...messages].reverse().find((message) => message.direction === "INBOUND");

  if (!latestInbound) {
    return null;
  }

  const replyText = await generateSocialReply({
    profile,
    thread,
    messages,
    chunks,
    question: latestInbound.text
  });

  const integration = integrations.find((item) => item.channel === thread.source);
  let deliveryStatus: SocialBotMessage["deliveryStatus"] = thread.externalThreadId.startsWith("demo_") ? "SENT" : "PENDING";
  const metadata: Record<string, unknown> = {};

  if (integration?.status === "CONNECTED" && !thread.externalThreadId.startsWith("demo_")) {
    try {
      await sendMetaReply({ integration, thread, messageText: replyText });
      deliveryStatus = "SENT";
    } catch (error) {
      deliveryStatus = "FAILED";
      metadata.error = error instanceof Error ? error.message : "Send failed.";
    }
  }

  const now = new Date().toISOString();
  const reply: SocialBotMessage = {
    _id: createSocialBotId("sbm"),
    userId: thread.userId,
    threadId: thread._id,
    source: thread.source,
    direction: "OUTBOUND",
    role: "ASSISTANT",
    text: replyText,
    timestamp: now,
    deliveryStatus,
    metadata
  };

  await appendMessage(reply);
  await saveThread({
    ...thread,
    lastMessagePreview: replyText,
    lastMessageAt: now,
    unreadCount: 0,
    updatedAt: now
  });

  return reply;
}

export async function ingestInboundMessage({
  userId,
  source,
  externalThreadId,
  contactName,
  contactHandle,
  text,
  metadata
}: {
  userId: string;
  source: SocialChannel;
  externalThreadId: string;
  contactName: string;
  contactHandle: string;
  text: string;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const existing = await getSocialBotThreadByExternalId(userId, source, externalThreadId);
  const thread: SocialBotThread = existing ?? {
    _id: createSocialBotId("sbt"),
    userId,
    source,
    externalThreadId,
    contactName,
    contactHandle,
    mode: "AI",
    lastMessagePreview: text,
    lastMessageAt: now,
    unreadCount: 1,
    createdAt: now,
    updatedAt: now
  };

  thread.contactName = contactName || thread.contactName;
  thread.contactHandle = contactHandle || thread.contactHandle;
  thread.lastMessagePreview = text;
  thread.lastMessageAt = now;
  thread.unreadCount = (existing?.unreadCount ?? 0) + 1;
  thread.updatedAt = now;

  await saveThread(thread);

  await appendMessage({
    _id: createSocialBotId("sbm"),
    userId,
    threadId: thread._id,
    source,
    direction: "INBOUND",
    role: "USER",
    text,
    timestamp: now,
    deliveryStatus: "SENT",
    metadata: metadata ?? {}
  });

  await maybeGenerateAiReply(thread);
  return getThreadWithMessages(userId, thread._id);
}
