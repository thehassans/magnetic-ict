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
const defaultInstructions = `You are a Lead Qualification Specialist and customer support assistant. Your goal is to provide helpful information to inbound leads and qualify them for the sales team.

Tone: Professional, helpful, and concise. Use emojis sparingly.
Language: Respond in the same language the user uses.

Workflow:
1. Greet the user and acknowledge their query.
2. If new, ask for their Name and Company.
3. Identify their Budget range, Timeline, and Pain Point before escalating.
4. Answer up to 3 product questions using the Knowledge Base. For pricing, say "Custom quotes are handled by our account managers."

Constraints:
- Never invent facts, pricing, or policies not in the Knowledge Base.
- Do not provide legal guarantees or compare to competitors.
- If the user asks to speak to a human, respond: "Thank you — connecting you with a specialist now."`.trim();

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
    lowerName.endsWith(".docx") || lowerName.endsWith(".doc")
  ) {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  if (file.type === "text/csv" || lowerName.endsWith(".csv")) {
    return buffer.toString("utf8");
  }

  if (file.type === "application/json" || lowerName.endsWith(".json")) {
    try {
      const parsed = JSON.parse(buffer.toString("utf8"));
      return JSON.stringify(parsed, null, 2);
    } catch {
      return buffer.toString("utf8");
    }
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, TXT, MD, CSV, or JSON files.");
}

const CRAWL_SKIP_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|otf|mp4|mp3|wav|ogg|zip|gz|tar|rar|pdf|doc|docx|xls|xlsx|ppt|pptx)(\?.*)?$/i;
const CRAWL_SKIP_PATHS = /\/(login|logout|signin|signout|sign-in|sign-out|register|signup|sign-up|cart|checkout|account|admin|wp-admin|wp-login)[\/?#]?/i;

async function fetchSitemapUrls(origin: string, maxUrls = 1000): Promise<string[]> {
  const collected = new Set<string>();

  async function parseSitemapXml(xmlUrl: string, depth = 0): Promise<void> {
    if (depth > 3 || collected.size >= maxUrls) return;
    try {
      const res = await fetch(xmlUrl, {
        headers: { "User-Agent": "MagneticChatbot/1.0 RAG-Crawler", "Accept": "application/xml,text/xml,*/*" },
        signal: AbortSignal.timeout(10_000)
      });
      if (!res.ok) return;
      const xml = await res.text();

      if (xml.includes("<sitemapindex")) {
        const subMatches = xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi);
        for (const m of subMatches) {
          if (collected.size >= maxUrls) break;
          const subUrl = m[1].trim();
          if (/\.xml(\?.*)?$/i.test(subUrl)) {
            await parseSitemapXml(subUrl, depth + 1);
          }
        }
      } else {
        const urlMatches = xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi);
        for (const m of urlMatches) {
          if (collected.size >= maxUrls) break;
          const pageUrl = m[1].trim();
          try {
            const parsed = new URL(pageUrl);
            if (parsed.origin === origin && !CRAWL_SKIP_EXTENSIONS.test(pageUrl)) {
              collected.add(pageUrl.replace(/\/$/, ""));
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* sitemap not found or failed */ }
  }

  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
    `${origin}/sitemaps.xml`,
    `${origin}/wp-sitemap.xml`,
    `${origin}/sitemap/sitemap-index.xml`
  ];

  for (const candidate of candidates) {
    await parseSitemapXml(candidate);
    if (collected.size > 0) break;
  }

  return Array.from(collected);
}

function extractTextFromHtml(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1] : "";
  const title = rawTitle.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]{2,8};/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, text: cleaned };
}

function extractLinks(html: string, baseUrl: string, origin: string): string[] {
  const links: string[] = [];
  const regex = /href=["']([^"'#][^"']*?)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      if (url.origin !== origin) continue;
      url.hash = "";
      const href = url.href.replace(/\/$/, "");
      if (!CRAWL_SKIP_EXTENSIONS.test(href) && !CRAWL_SKIP_PATHS.test(href)) {
        links.push(href);
      }
    } catch {
      /* skip invalid hrefs */
    }
  }
  return links;
}

export async function crawlWebsite(
  startUrl: string,
  maxPages = 10
): Promise<{ url: string; title: string; text: string }[]> {
  let origin: string;
  let normalized: string;
  try {
    const raw = startUrl.trim();
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    origin = parsed.origin;
    parsed.hash = "";
    normalized = parsed.href.replace(/\/$/, "");
  } catch {
    throw new Error("Invalid URL. Please enter a full URL including https://");
  }

  const results: { url: string; title: string; text: string }[] = [];
  const visited = new Set<string>();
  const queue: string[] = [normalized];
  const limit = Math.min(Math.max(1, maxPages), 25);

  while (queue.length > 0 && results.length < limit) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MagneticChatbot/1.0 (+https://magnetic-ict.com) RAG-Crawler",
          "Accept": "text/html"
        },
        signal: AbortSignal.timeout(10_000)
      });

      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();
      const { title, text } = extractTextFromHtml(html);
      if (text.length < 30) continue;

      results.push({ url, title: title || url, text });

      const newLinks = extractLinks(html, url, origin);
      for (const link of newLinks) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }
    } catch {
      /* skip pages that fail to load */
    }
  }

  if (results.length === 0) {
    throw new Error(`No readable pages found at ${origin}. The site may require JavaScript rendering, block crawlers, or return no HTML content. Try a different URL or upload a document instead.`);
  }

  return results;
}

export async function crawlWebsiteWithCallback(
  startUrl: string,
  maxPages: number,
  onPage: (page: { url: string; title: string; text: string }, index: number) => Promise<void>,
  onDiscover?: (url: string, queueSize: number) => void,
  onSitemapFound?: (count: number) => void
): Promise<{ totalCrawled: number; usedSitemap: boolean }> {
  let origin: string;
  let normalized: string;
  try {
    const raw = startUrl.trim();
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    origin = parsed.origin;
    parsed.hash = "";
    normalized = parsed.href.replace(/\/$/, "");
  } catch {
    throw new Error("Invalid URL. Please enter a full URL including https://");
  }

  const unlimited = maxPages === 0;
  const limit = unlimited ? 1000 : Math.max(1, maxPages);
  const visited = new Set<string>();
  let totalCrawled = 0;
  let usedSitemap = false;

  const sitemapUrls = await fetchSitemapUrls(origin, limit);

  if (sitemapUrls.length > 0) {
    usedSitemap = true;
    onSitemapFound?.(sitemapUrls.length);

    const queue = [normalized, ...sitemapUrls.filter((u) => u !== normalized)];

    for (const url of queue) {
      if (totalCrawled >= limit) break;
      if (visited.has(url)) continue;
      visited.add(url);

      onDiscover?.(url, queue.length - visited.size);

      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "MagneticChatbot/1.0 RAG-Crawler", "Accept": "text/html" },
          signal: AbortSignal.timeout(12_000)
        });
        if (!response.ok) continue;
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html")) continue;

        const html = await response.text();
        const { title, text } = extractTextFromHtml(html);
        if (text.length < 30) continue;

        await onPage({ url, title: title || url, text }, totalCrawled);
        totalCrawled++;
      } catch { /* skip */ }
    }
  } else {
    const queue: string[] = [normalized];

    while (queue.length > 0 && totalCrawled < limit) {
      const url = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "MagneticChatbot/1.0 RAG-Crawler", "Accept": "text/html" },
          signal: AbortSignal.timeout(12_000)
        });
        if (!response.ok) continue;
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html")) continue;

        const html = await response.text();
        const { title, text } = extractTextFromHtml(html);
        if (text.length < 30) continue;

        const newLinks = extractLinks(html, url, origin);
        for (const link of newLinks) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
            onDiscover?.(link, queue.length);
          }
        }

        await onPage({ url, title: title || url, text }, totalCrawled);
        totalCrawled++;
      } catch { /* skip */ }
    }
  }

  return { totalCrawled, usedSitemap };
}

async function getAIConfig() {
  const settings = await getPlatformSettings();
  return {
    geminiKey: settings.geminiConfig.apiKey.trim(),
    openAiKey: settings.geminiConfig.openAiApiKey.trim(),
    groqKey: settings.geminiConfig.groqApiKey.trim()
  };
}

export async function embedText(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const { geminiKey, openAiKey } = await getAIConfig();

  // ── 1. Gemini embeddings ──────────────────────────────────────────────────
  if (geminiKey) {
    const geminiModels: { modelId: string; body: Record<string, unknown> }[] = [
      {
        modelId: "text-embedding-004",
        body: { model: "models/text-embedding-004", taskType, content: { parts: [{ text }] } }
      },
      {
        modelId: "text-embedding-preview-0409",
        body: { model: "models/text-embedding-preview-0409", taskType, content: { parts: [{ text }] } }
      },
      {
        modelId: "embedding-001",
        body: { model: "models/embedding-001", content: { parts: [{ text }] } }
      }
    ];

    for (const { modelId, body } of geminiModels) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const payload = (await response.json()) as {
        embedding?: { values?: number[] };
        error?: { message?: string };
      };

      if (response.ok && payload.embedding?.values?.length) {
        return payload.embedding.values;
      }

      const errMsg = (payload.error?.message ?? "").toLowerCase();
      const modelGone = ["not found", "no longer available", "not supported", "deprecated"]
        .some((phrase) => errMsg.includes(phrase));
      if (!modelGone) break;
    }
  }

  // ── 2. OpenAI embeddings fallback ────────────────────────────────────────
  if (openAiKey) {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text })
    });

    const payload = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
      error?: { message?: string };
    };

    if (response.ok && payload.data?.[0]?.embedding?.length) {
      return payload.data[0].embedding;
    }
  }

  throw new Error("Unable to create embeddings. Add a Gemini or OpenAI API key in Admin › AI Settings.");
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

  const chunksWithEmbeddings = chunks.filter((c) => c.embedding.length > 0);

  if (chunksWithEmbeddings.length === 0) {
    return chunks.slice(0, topKResults);
  }

  try {
    const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY");

    return [...chunksWithEmbeddings]
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, topKResults)
      .map((entry) => entry.chunk);
  } catch {
    return chunksWithEmbeddings.slice(0, topKResults);
  }
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
  const { geminiKey, openAiKey, groqKey } = await getAIConfig();
  const settings = await getPlatformSettings();

  if (!geminiKey && !openAiKey && !groqKey) {
    throw new Error("Add a Gemini, OpenAI, or Groq API key in Admin › AI Settings.");
  }

  const memory = formatConversationMemory(messages);
  const relevant = await retrieveRelevantKnowledge(chunks, question);
  const context = relevant.map((chunk) => `[Source: ${chunk.fileName}]\n${chunk.content}`).join("\n\n");
  const globalInstructions = settings.socialBotConfig.globalBotInstructions.trim() || defaultInstructions;
  const businessContext = profile
    ? `Business Name: ${profile.businessName || "Unknown"}\nIndustry: ${profile.industry || "Unknown"}`
    : "Business Name: Unknown\nIndustry: Unknown";

  const promptText = `${businessContext}\n\nConversation Memory:\n${memory || "No prior messages."}\n\nKnowledge Base Context:\n${context || "No knowledge base context available."}\n\nLatest Customer Message:\n${question}\n\nWrite the exact reply to send.`;
  const systemText = `${globalInstructions}\n\nUse the last messages to maintain a human-like flow. Keep replies concise and natural for ${thread.source.toLowerCase()} conversations.`;

  // ── 1. Gemini ─────────────────────────────────────────────────────────────
  if (geminiKey) {
    const requestBody = {
      system_instruction: { parts: [{ text: systemText }] },
      contents: [{ role: "user", parts: [{ text: promptText }] }]
    };

    const generationModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelId of generationModels) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        }
      );

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      if (response.ok && text) return text;

      const errMsg = (payload.error?.message ?? "").toLowerCase();
      const modelGone = ["not found", "no longer available", "not supported", "deprecated"]
        .some((phrase) => errMsg.includes(phrase));
      if (!modelGone) break;
    }
  }

  // ── 2. OpenAI fallback ────────────────────────────────────────────────────
  if (openAiKey) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemText },
          { role: "user", content: promptText }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    const text = payload.choices?.[0]?.message?.content?.trim();
    if (response.ok && text) return text;
  }

  // ── 3. Groq fallback ──────────────────────────────────────────────────────
  if (groqKey) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemText },
          { role: "user", content: promptText }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    const text = payload.choices?.[0]?.message?.content?.trim();
    if (response.ok && text) return text;
  }

  throw new Error("All AI providers failed. Check your Gemini, OpenAI, and Groq keys in Admin › AI Settings.");
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

export async function sendInfobipReply({
  to,
  messageText,
  apiKey,
  baseUrl,
  senderNumber
}: {
  to: string;
  messageText: string;
  apiKey: string;
  baseUrl: string;
  senderNumber: string;
}) {
  const cleanBase = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${cleanBase}/whatsapp/1/message/text`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `App ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      from: senderNumber,
      to,
      content: { text: messageText }
    })
  });

  const data = (await response.json().catch(() => ({}))) as {
    requestError?: { serviceException?: { text?: string } };
  };

  if (!response.ok) {
    const msg = data.requestError?.serviceException?.text ?? "Infobip WhatsApp send failed.";
    throw new Error(msg);
  }
}
