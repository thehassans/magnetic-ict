import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPortfolioSiteById, updatePortfolioSite, saveChatMessage, getChatMessages } from "@/lib/portfolio-db";
import { getPlatformSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Magnetic Portfolio Builder AI assistant. Your job is to help customers manage and update their personal portfolio website through natural conversation.

When the user asks you to update something on their site (e.g. change phone number, update bio, add a skill, update address), you MUST respond with a JSON block in your message in the following format:

<update>
{
  "field": "fieldName",
  "value": "new value"
}
</update>

Supported fields and their types:
- name (string): Owner/business display name
- tagline (string): Short headline under the name
- about (string): Bio/about text
- phone (string): Phone number
- email (string): Contact email
- address (string): Physical address or location
- accentColor (string): Hex color code like #6366f1
- skills (array of strings): e.g. ["React", "Node.js", "Design"]
- status ("DRAFT" | "ACTIVE"): Publish or unpublish the site

For any update, also provide a friendly confirmation message explaining what you did.
If the user is just chatting or asking questions, respond naturally without an update block.
Keep responses concise and professional.`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);
  if (!site || site.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await getChatMessages(siteId, 60);
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);
  if (!site || site.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { message } = (await request.json().catch(() => ({}))) as { message?: string };
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const settings = await getPlatformSettings();
  const apiKey = settings.geminiConfig.apiKey.trim();
  if (!apiKey) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  await saveChatMessage({ siteId, userId: session.user.id, role: "user", content: message });

  const history = await getChatMessages(siteId, 20);
  const siteContext = `Current portfolio data:\nName: ${site.name}\nTagline: ${site.tagline}\nAbout: ${site.about}\nPhone: ${site.phone}\nEmail: ${site.email}\nAddress: ${site.address}\nSkills: ${site.skills.join(", ") || "none"}\nStatus: ${site.status}\nAccent color: ${site.accentColor}`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + siteContext }] },
    { role: "model", parts: [{ text: "I understand. I'm ready to help manage your portfolio site." }] },
    ...history.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    }
  );

  if (!geminiRes.ok) return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  const geminiData = (await geminiRes.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't process that request.";

  const updateMatch = aiText.match(/<update>([\s\S]*?)<\/update>/);
  let appliedUpdate: { field: string; value: unknown } | null = null;

  if (updateMatch) {
    try {
      const parsed = JSON.parse(updateMatch[1].trim()) as { field: string; value: unknown };
      const allowedFields = ["name","tagline","about","phone","email","address","accentColor","skills","status"];
      if (allowedFields.includes(parsed.field)) {
        await updatePortfolioSite(siteId, session.user.id, { [parsed.field]: parsed.value });
        appliedUpdate = parsed;
      }
    } catch { /* ignore parse errors */ }
  }

  const cleanText = aiText.replace(/<update>[\s\S]*?<\/update>/g, "").trim();
  await saveChatMessage({ siteId, userId: session.user.id, role: "assistant", content: cleanText });

  return NextResponse.json({ reply: cleanText, appliedUpdate });
}
