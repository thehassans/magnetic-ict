import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { addKnowledgeDocument } from "@/lib/social-bot-service";
import { crawlWebsiteWithCallback } from "@/lib/social-bot-rag";

export const runtime = "nodejs";
export const maxDuration = 180;

type SseEvent =
  | { type: "start"; origin: string; limit: number }
  | { type: "sitemap"; count: number }
  | { type: "crawling"; url: string; index: number }
  | { type: "indexed"; url: string; title: string; chunks: number; index: number }
  | { type: "failed"; url: string; reason: string; index: number }
  | { type: "discovered"; url: string; queueSize: number }
  | { type: "done"; indexed: number; failed: number; total: number; usedSitemap: boolean; message: string }
  | { type: "error"; message: string };

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) {
    return new Response(JSON.stringify({ error: "Access denied." }), { status: 403 });
  }

  const { url, maxPages } = (await request.json()) as { url?: string; maxPages?: number };
  if (!url?.trim()) {
    return new Response(JSON.stringify({ error: "URL is required." }), { status: 400 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          /* client disconnected */
        }
      };

      let indexed = 0;
      let failed = 0;
      let total = 0;

      try {
        const raw = url.trim();
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        const origin = new URL(withProtocol).origin;
        const unlimited = !maxPages || maxPages === 0;
        const limit = unlimited ? 0 : Math.max(1, maxPages);

        send({ type: "start", origin, limit: unlimited ? 1000 : limit });

        const result = await crawlWebsiteWithCallback(
          withProtocol,
          limit,
          async (page, index) => {
            total = index + 1;
            send({ type: "crawling", url: page.url, index });

            try {
              await addKnowledgeDocument({
                userId,
                fileName: page.title.slice(0, 200) || page.url,
                mimeType: "text/html",
                text: page.text,
                sourceUrl: page.url
              });
              indexed++;
              const wordCount = page.text.split(" ").length;
              const approxChunks = Math.max(1, Math.ceil(wordCount / 100));
              send({ type: "indexed", url: page.url, title: page.title, chunks: approxChunks, index });
            } catch (err) {
              failed++;
              send({ type: "failed", url: page.url, reason: err instanceof Error ? err.message : "Index error", index });
            }
          },
          (discoveredUrl, queueSize) => {
            send({ type: "discovered", url: discoveredUrl, queueSize });
          },
          (sitemapCount) => {
            send({ type: "sitemap", count: sitemapCount });
          }
        );

        if (indexed === 0) {
          send({ type: "error", message: "Crawl completed but no pages could be indexed. The site may block crawlers or use JavaScript rendering." });
        } else {
          send({ type: "done", indexed, failed, total, usedSitemap: result.usedSitemap, message: `${indexed} page${indexed === 1 ? "" : "s"} indexed from ${new URL(withProtocol).hostname}.` });
        }
      } catch (error) {
        send({ type: "error", message: error instanceof Error ? error.message : "Failed to crawl website." });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    }
  });
}
