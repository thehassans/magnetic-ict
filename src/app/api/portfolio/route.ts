import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userHasPortfolioAccess } from "@/lib/portfolio-access";
import { createPortfolioSite, getPortfolioSite } from "@/lib/portfolio-db";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getPortfolioSite(session.user.id);
  return NextResponse.json({ site: site ?? null });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasAccess = await userHasPortfolioAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Portfolio Builder is not unlocked for this account." }, { status: 403 });

  const existing = await getPortfolioSite(session.user.id);
  if (existing) return NextResponse.json({ site: existing });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const subdomain = (typeof body.subdomain === "string" ? body.subdomain.trim() : "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!subdomain) return NextResponse.json({ error: "Subdomain is required." }, { status: 400 });

  const site = await createPortfolioSite({
    userId: session.user.id,
    planTier: "starter",
    name,
    tagline: "",
    about: "",
    phone: "",
    email: session.user.email ?? "",
    address: "",
    logoLight: "",
    logoDark: "",
    socialLinks: [],
    customDomain: "",
    subdomain,
    selectedTemplate: "aurora",
    skills: [],
    projects: [],
    experience: [],
    accentColor: "#6366f1",
    status: "DRAFT"
  });

  return NextResponse.json({ site }, { status: 201 });
}
