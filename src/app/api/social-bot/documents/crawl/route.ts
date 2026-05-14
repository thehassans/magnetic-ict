import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { addKnowledgeDocument } from "@/lib/social-bot-service";
import { crawlWebsite } from "@/lib/social-bot-rag";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { url, maxPages } = (await request.json()) as { url?: string; maxPages?: number };

    if (!url?.trim()) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const pages = await crawlWebsite(url.trim(), maxPages ?? 10);

    const userId = session.user.id;
    let indexed = 0;
    const errors: string[] = [];

    for (const page of pages) {
      try {
        await addKnowledgeDocument({
          userId,
          fileName: page.title.slice(0, 200) || page.url,
          mimeType: "text/html",
          text: page.text
        });
        indexed++;
      } catch (err) {
        errors.push(page.url);
        console.error(`Failed to index page ${page.url}:`, err);
      }
    }

    if (indexed === 0) {
      return NextResponse.json(
        { error: "Crawl completed but no pages could be indexed. Try a different URL." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      pagesFound: pages.length,
      pagesIndexed: indexed,
      failedPages: errors.length,
      message: `${indexed} page${indexed === 1 ? "" : "s"} indexed from ${new URL(url.trim()).hostname}.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to crawl website." },
      { status: 500 }
    );
  }
}
