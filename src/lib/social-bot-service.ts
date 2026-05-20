import { z } from "zod";
import {
  createSocialBotId,
  deleteMongoDocuments,
  findMongoDocuments,
  getSocialBotAgents,
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
import { splitIntoChunks, embedText, encryptSecret, generateSocialReply, sendMetaReply, decryptSecret, fetchWhatsAppAudioBuffer, transcribeAudioBuffer, generateSpeechBuffer, sendWhatsAppVoiceReply, sendMessengerVoiceReply } from "@/lib/social-bot-rag";
import { getPlatformSettings } from "@/lib/platform-settings";
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
  const clearing = payload.accessToken === "__CLEAR__";
  const accessTokenEncrypted = clearing ? "" : payload.accessToken ? encryptSecret(payload.accessToken) : current?.accessTokenEncrypted ?? "";
  const connected = payload.enabled && !clearing && Boolean(payload.accessToken || current?.accessTokenEncrypted);

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
  text,
  sourceUrl
}: {
  userId: string;
  fileName: string;
  mimeType: string;
  text: string;
  sourceUrl?: string;
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
    sourceUrl: sourceUrl ?? undefined,
    createdAt: now,
    updatedAt: now
  };

  await insertMongoDocument(socialBotCollections.documents, document);

  try {
    const textChunks = splitIntoChunks(text);

    if (textChunks.length === 0) {
      throw new Error("No readable text could be extracted from this document.");
    }

    const initialChunks = textChunks.map((content) => ({
      _id: createSocialBotId("sbc"),
      userId,
      documentId,
      fileName,
      content,
      embedding: [] as number[],
      createdAt: new Date().toISOString()
    }));

    await insertManyMongoDocuments(socialBotCollections.chunks, initialChunks);

    await upsertMongoDocument(
      socialBotCollections.documents,
      { _id: documentId, userId },
      {
        status: "READY",
        chunkCount: initialChunks.length,
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

    for (const chunk of initialChunks) {
      try {
        const embedding = await embedText(chunk.content, "RETRIEVAL_DOCUMENT");
        await upsertMongoDocument(
          socialBotCollections.chunks,
          { _id: chunk._id, userId },
          { embedding }
        );
      } catch {
        /* Embedding failed for this chunk — user can retrain later */
      }
    }
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

export async function deleteKnowledgeDocument(userId: string, documentId: string) {
  await deleteMongoDocuments(socialBotCollections.chunks, { userId, documentId });
  await deleteMongoDocuments(socialBotCollections.documents, { _id: documentId, userId });

  const remaining = await getSocialBotDocuments(userId);
  const hasReady = remaining.some((document) => document.status === "READY");

  await upsertMongoDocument(
    socialBotCollections.profiles,
    { userId },
    { knowledgeBaseReady: hasReady, updatedAt: new Date().toISOString() }
  );

  return remaining;
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
      assignedAgentId: thread.assignedAgentId ?? null,
      assignedAgentName: thread.assignedAgentName ?? null,
      autoAssign: thread.autoAssign ?? false,
      updatedAt: thread.updatedAt
    },
    {
      _id: thread._id,
      userId: thread.userId,
      createdAt: thread.createdAt
    }
  );
}

export async function assignAgentToThread(userId: string, threadId: string, agentId: string | null) {
  const current = await getSocialBotThreadById(userId, threadId);
  if (!current) return null;

  let agentName: string | null = null;
  if (agentId) {
    const agents = await getSocialBotAgents(userId);
    agentName = agents.find((a) => a._id === agentId)?.name ?? null;
  }

  await saveThread({
    ...current,
    assignedAgentId: agentId,
    assignedAgentName: agentName,
    updatedAt: new Date().toISOString()
  });

  return getSocialBotThreadById(userId, threadId);
}

export async function autoAssignAgent(userId: string, threadId: string) {
  const current = await getSocialBotThreadById(userId, threadId);
  if (!current) return null;

  const agents = await getSocialBotAgents(userId);
  const match = agents.find((a) => a.isActive && (a.channels.length === 0 || a.channels.includes(current.source)));

  await saveThread({
    ...current,
    assignedAgentId: match?._id ?? null,
    assignedAgentName: match?.name ?? null,
    autoAssign: true,
    updatedAt: new Date().toISOString()
  });

  return getSocialBotThreadById(userId, threadId);
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
      const result = await sendMetaReply({ integration, thread, messageText: payload.text });
      deliveryStatus = "SENT";
      if (result?.wamid) metadata.wamid = result.wamid;
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

async function maybeGenerateAiVoiceReply(
  thread: SocialBotThread,
  inboundMsg: SocialBotMessage,
  integrations: SocialBotIntegration[],
  overrideSend?: (replyText: string) => Promise<void>
): Promise<SocialBotMessage | null> {
  try {
    const settings = await getPlatformSettings();
    const openAiKey = settings.geminiConfig.openAiApiKey.trim();

    // ── Get audio buffer ───────────────────────────────────────────────
    const mediaId = inboundMsg.metadata?.mediaId as string | undefined;
    const audioUrl = inboundMsg.metadata?.audioUrl as string | undefined;
    let audioBuffer: Buffer | null = null;
    let audioMimeType = "audio/ogg";

    if (mediaId && thread.source === "WHATSAPP") {
      const integration = integrations.find((i) => i.channel === "WHATSAPP" && i.status === "CONNECTED");
      if (integration) {
        const result = await fetchWhatsAppAudioBuffer(mediaId, decryptSecret(integration.accessTokenEncrypted));
        if (result) { audioBuffer = result.buffer; audioMimeType = result.mimeType; }
      }
    } else if (audioUrl) {
      if (audioUrl.startsWith("data:")) {
        const commaIdx = audioUrl.indexOf(",");
        if (commaIdx !== -1) {
          const mimeMatch = audioUrl.slice(0, commaIdx).match(/data:([^;]+)/);
          audioMimeType = mimeMatch?.[1] ?? "audio/mpeg";
          audioBuffer = Buffer.from(audioUrl.slice(commaIdx + 1), "base64");
        }
      } else {
        try {
          const res = await fetch(audioUrl, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            audioBuffer = Buffer.from(await res.arrayBuffer());
            audioMimeType = res.headers.get("content-type") ?? "audio/mpeg";
          }
        } catch { /* ignore */ }
      }
    }

    if (!audioBuffer || !openAiKey) return null;

    // ── Transcribe ─────────────────────────────────────────────────────
    const transcription = await transcribeAudioBuffer(audioBuffer, audioMimeType, openAiKey);
    if (!transcription?.transcript) return null;

    // ── Generate text reply ────────────────────────────────────────────
    const [profile, chunks, messages] = await Promise.all([
      getSocialBotProfile(thread.userId),
      getSocialBotChunks(thread.userId),
      getSocialBotMessages(thread.userId, thread._id)
    ]);
    const replyText = await generateSocialReply({
      profile,
      thread,
      messages,
      chunks,
      question: transcription.transcript
    });

    // ── Convert to speech ──────────────────────────────────────────────
    const speech = await generateSpeechBuffer(replyText, transcription.language, settings.ttsConfig, openAiKey);
    if (!speech) {
      // Fall back to text reply if TTS not configured
      return null;
    }

    const base64Audio = `data:${speech.mimeType};base64,${speech.buffer.toString("base64")}`;
    const now = new Date().toISOString();
    let deliveryStatus: SocialBotMessage["deliveryStatus"] = thread.externalThreadId.startsWith("demo_") ? "SENT" : "PENDING";
    let voiceMeta: Record<string, unknown> = { mediaType: "audio", audioUrl: base64Audio };

    // ── Send voice message ─────────────────────────────────────────────
    if (!thread.externalThreadId.startsWith("demo_")) {
      if (thread.source === "WHATSAPP") {
        const integration = integrations.find((i) => i.channel === "WHATSAPP" && i.status === "CONNECTED");
        if (integration) {
          const result = await sendWhatsAppVoiceReply(
            thread.externalThreadId,
            integration.phoneNumberId,
            decryptSecret(integration.accessTokenEncrypted),
            speech.buffer,
            speech.mimeType
          );
          if (result) {
            deliveryStatus = "SENT";
            voiceMeta = { mediaType: "audio", mediaId: result.mediaId, audioUrl: base64Audio, wamid: result.wamid };
          } else {
            deliveryStatus = "FAILED";
          }
        }
      } else {
        const integration = integrations.find((i) => i.channel === thread.source && i.status === "CONNECTED");
        const accessToken = integration ? decryptSecret(integration.accessTokenEncrypted) : "";
        if (overrideSend) {
          await overrideSend(replyText).catch(() => null);
          deliveryStatus = "SENT";
        } else if (accessToken) {
          const result = await sendMessengerVoiceReply(
            thread.externalThreadId,
            integration?.pageId ?? null,
            accessToken,
            speech.buffer
          );
          if (result) {
            deliveryStatus = "SENT";
            voiceMeta = { mediaType: "audio", audioUrl: base64Audio, wamid: result.wamid };
          } else {
            deliveryStatus = "FAILED";
          }
        }
      }
    }

    const reply: SocialBotMessage = {
      _id: createSocialBotId("sbm"),
      userId: thread.userId,
      threadId: thread._id,
      source: thread.source,
      direction: "OUTBOUND",
      role: "ASSISTANT",
      text: "🎤 Voice message",
      timestamp: now,
      deliveryStatus,
      metadata: voiceMeta
    };

    await appendMessage(reply);
    await saveThread({
      ...thread,
      lastMessagePreview: "🎤 Voice message",
      lastMessageAt: now,
      unreadCount: 0,
      updatedAt: now
    });

    return reply;
  } catch (err) {
    console.error("[AI voice reply]", err);
    return null;
  }
}

export async function maybeGenerateAiReply(
  thread: SocialBotThread,
  overrideSend?: (replyText: string) => Promise<void>
) {
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

  // Don't auto-reply to image/video — AI can't see content.
  // For audio, attempt AI voice reply pipeline.
  const inboundMediaType = latestInbound.metadata?.mediaType as string | undefined;
  if (inboundMediaType === "image" || inboundMediaType === "video") {
    return null;
  }

  if (inboundMediaType === "audio") {
    return maybeGenerateAiVoiceReply(thread, latestInbound, integrations, overrideSend);
  }

  const replyText = await generateSocialReply({
    profile,
    thread,
    messages,
    chunks,
    question: latestInbound.text
  });

  let deliveryStatus: SocialBotMessage["deliveryStatus"] = thread.externalThreadId.startsWith("demo_") ? "SENT" : "PENDING";
  const metadata: Record<string, unknown> = {};

  if (!thread.externalThreadId.startsWith("demo_")) {
    try {
      if (overrideSend) {
        await overrideSend(replyText);
        deliveryStatus = "SENT";
      } else {
        const integration = integrations.find((item) => item.channel === thread.source);
        if (integration?.status === "CONNECTED") {
          const result = await sendMetaReply({ integration, thread, messageText: replyText });
          deliveryStatus = "SENT";
          if (result?.wamid) metadata.wamid = result.wamid;
        }
      }
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
  metadata,
  overrideSend
}: {
  userId: string;
  source: SocialChannel;
  externalThreadId: string;
  contactName: string;
  contactHandle: string;
  text: string;
  metadata?: Record<string, unknown>;
  overrideSend?: (replyText: string) => Promise<void>;
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

  // Update contact name:
  // - If new value is a real name (not just the phone/PSID), always prefer it
  // - If stored name is already a real name, keep it
  // - If everything is a numeric fallback, format it nicely with a + prefix for phones
  const isRealName = (n: string) => !!n && n !== contactHandle && !/^\d{7,}$/.test(n.trim());
  const storedIsRealName = isRealName(thread.contactName ?? "");
  const newIsRealName = isRealName(contactName ?? "");
  if (newIsRealName) {
    thread.contactName = contactName;
  } else if (!storedIsRealName) {
    // Both are numeric/PSID fallbacks — format phone as +XXXXXXXX
    const raw = contactHandle || contactName;
    thread.contactName = raw && /^\d+$/.test(raw.trim()) ? `+${raw.trim()}` : (raw || contactHandle);
  }
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

  await maybeGenerateAiReply(thread, overrideSend);
  return getThreadWithMessages(userId, thread._id);
}

export async function deleteThread(userId: string, threadId: string) {
  await deleteMongoDocuments(socialBotCollections.messages, { userId, threadId });
  await deleteMongoDocuments(socialBotCollections.threads, { userId, _id: threadId });
}

export async function setThreadAutoAssign(userId: string, threadId: string, value: boolean) {
  await upsertMongoDocument(
    socialBotCollections.threads,
    { userId, _id: threadId },
    { autoAssign: value, updatedAt: new Date().toISOString() }
  );
  return getSocialBotThreadById(userId, threadId);
}

export async function updateMessageDeliveryStatus(
  userId: string,
  wamid: string,
  status: "DELIVERED" | "READ"
) {
  const msgs = await findMongoDocuments<{ _id: string }>(
    socialBotCollections.messages,
    { userId, "metadata.wamid": wamid }
  );
  for (const m of msgs) {
    await upsertMongoDocument(
      socialBotCollections.messages,
      { _id: m._id, userId },
      { deliveryStatus: status }
    );
  }
}
