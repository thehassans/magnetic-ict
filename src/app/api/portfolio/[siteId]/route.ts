import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPortfolioSiteById, updatePortfolioSite, deletePortfolioSite } from "@/lib/portfolio-db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);
  if (!site || site.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const allowed = ["name","tagline","about","phone","email","address","socialLinks","customDomain","subdomain","selectedTemplate","skills","projects","experience","accentColor","status"] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  await updatePortfolioSite(siteId, session.user.id, patch);
  const updated = await getPortfolioSiteById(siteId);
  return NextResponse.json({ site: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  await deletePortfolioSite(siteId, session.user.id);
  return NextResponse.json({ ok: true });
}
