import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getPlatformSettings } from "@/lib/platform-settings";
import { createSocialBotId } from "@/lib/social-bot-db";
import type {
  SocialBotChunk,
  SocialBotIntegration,
  SocialBotMessage,
  SocialBotProfile,
  SocialBotThread
} from "@/lib/social-bot-types";

const chunkSize = 1000;
const chunkOverlap = 200;
const topKResults = 8;
const memoryWindow = 10;
const defaultInstructions = "You are Magnetic Social Bot, a human-like social media assistant for business conversations. Reply clearly, briefly, warmly, and naturally. Use the business knowledge base when relevant. Never invent business facts, pricing, hours, or policies. If context is missing, ask a concise follow-up question instead of guessing.";

function getResolvedEncryptionSecret() {
  const source = process.env.SOCIAL_BOT_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "magnetic-social-bot";
  return createHash("sha256").update(source).digest();
}

export function encryptSecret(value: string) {
  if (!value) {
    return "";
  }

  const iv = randomBytes(12);
  const key = getResolvedEncryptionSecret();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(value: string) {
  if (!value) {
    return "";
  }

  const payload = Buffer.from(value, "base64");
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getResolvedEncryptionSecret(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function splitIntoChunks(text: string) {
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return [] as string[];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    chunks.push(cleanText.slice(start, end));

    if (end >= cleanText.length) {
      break;
    }

    start = Math.max(end - chunkOverlap, start + 1);
  }

  return chunks;
}

export async function extractTextFromUploadedFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (file.type === "text/plain" || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return buffer.toString("utf8");
  }

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as { default?: (value: Buffer) => Promise<{ text: string }> }).default;
    const parsed = await (pdfParse ? pdfParse(buffer) : (pdfParseModule as unknown as (value: Buffer) => Promise<{ text: string }>)(buffer));
    return parsed.text;
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  throw new Error("Only PDF, DOCX, and TXT files are supported.");
}

async function getGeminiApiKey() {
  const settings = await getPlatformSettings();
  const apiKey = settings.geminiConfig.apiKey.trim();

  if (!apiKey) {
    throw new Error("Add a Gemini API key in Admin Settings.");
  }

  return apiKey;
}

export async function embedText(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const apiKey = await getGeminiApiKey();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        taskType,
        content: {
          parts: [{ text }]
        },
        outputDimensionality: 768
      })
    }
  );

  const payload = (await response.json()) as {
    embedding?: { values?: number[] };
    error?: { message?: string };
  };

  if (!response.ok || !payload.embedding?.values) {
    throw new Error(payload.error?.message ?? "Unable to create embeddings.");
  }

  return payload.embedding.values;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function buildKnowledgeChunks({
  userId,
  documentId,
  fileName,
  text
}: {
  userId: string;
  documentId: string;
  fileName: string;
  text: string;
}) {
  const chunks = splitIntoChunks(text);
  const records: SocialBotChunk[] = [];

  for (const chunk of chunks) {
    const embedding = await embedText(chunk, "RETRIEVAL_DOCUMENT");
    records.push({
      _id: createSocialBotId("sbc"),
      userId,
      documentId,
      fileName,
      content: chunk,
      embedding,
      createdAt: new Date().toISOString()
    });
  }

  return records;
}

export async function retrieveRelevantKnowledge(chunks: SocialBotChunk[], question: string) {
  if (chunks.length === 0) {
    return [] as SocialBotChunk[];
  }

  const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY");

  return [...chunks]
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topKResults)
    .map((entry) => entry.chunk);
}

export function formatConversationMemory(messages: SocialBotMessage[]) {
  return messages
    .slice(-memoryWindow)
    .map((message) => `${message.role === "ASSISTANT" ? "Assistant" : message.role === "AGENT" ? "Agent" : "User"}: ${message.text}`)
    .join("\n");
}

export async function generateSocialReply({
  profile,
  thread,
  messages,
  chunks,
  question
}: {
  profile: SocialBotProfile | null;
  thread: SocialBotThread;
  messages: SocialBotMessage[];
  chunks: SocialBotChunk[];
  question: string;
}) {
  const settings = await getPlatformSettings();
  const apiKey = settings.geminiConfig.apiKey.trim();

  if (!apiKey) {
    throw new Error("Add a Gemini API key in Admin Settings.");
  }

  const memory = formatConversationMemory(messages);
  const relevant = await retrieveRelevantKnowledge(chunks, question);
  const context = relevant.map((chunk) => `[Source: ${chunk.fileName}]\n${chunk.content}`).join("\n\n");
  const globalInstructions = settings.socialBotConfig.globalBotInstructions.trim() || defaultInstructions;
  const businessContext = profile ? `Business Name: ${profile.businessName || "Unknown"}\nIndustry: ${profile.industry || "Unknown"}` : "Business Name: Unknown\nIndustry: Unknown";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: `${globalInstructions}\n\nUse the last messages to maintain a human-like flow. Keep replies concise and natural for ${thread.source.toLowerCase()} conversations.`
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${businessContext}\n\nConversation Memory:\n${memory || "No prior messages."}\n\nKnowledge Base Context:\n${context || "No knowledge base context available."}\n\nLatest Customer Message:\n${question}\n\nWrite the exact reply to send.`
              }
            ]
          }
        ]
      })
    }
  );

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
    error?: { message?: string };
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!response.ok || !text) {
    throw new Error(payload.error?.message ?? "Gemini could not generate a response.");
  }

  return text;
}

export async function sendMetaReply({
  integration,
  thread,
  messageText
}: {
  integration: SocialBotIntegration;
  thread: SocialBotThread;
  messageText: string;
}) {
  const accessToken = decryptSecret(integration.accessTokenEncrypted);

  if (!accessToken) {
    throw new Error(`No access token stored for ${integration.channel}.`);
  }

  const url =
    integration.channel === "WHATSAPP"
      ? `https://graph.facebook.com/v22.0/${integration.phoneNumberId}/messages`
      : "https://graph.facebook.com/v22.0/me/messages";

  const body =
    integration.channel === "WHATSAPP"
      ? {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: thread.externalThreadId,
          type: "text",
          text: { body: messageText }
        }
      : {
          recipient: { id: thread.externalThreadId },
          messaging_type: "RESPONSE",
          message: { text: messageText }
        };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Unable to send reply to ${integration.channel}.`);
  }
}
