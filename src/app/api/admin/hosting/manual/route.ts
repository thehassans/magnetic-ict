import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createManualHostingProvision } from "@/lib/hosting-db";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const requestSchema = z.object({
  userId: z.string().min(1),
  tierName: z.string(),
  panel: z.enum(["none", "plesk", "cpanel", "directadmin", "custom"]),
  panelLabel: z.string(),
  loginUrl: z.string(),
  username: z.string(),
  isReady: z.boolean(),
  notes: z.string()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const provision = await createManualHostingProvision({
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      tierName: parsed.tierName.trim() || "Manual VPS",
      panel: parsed.panel,
      panelLabel: parsed.panelLabel.trim() || null,
      loginUrl: parsed.loginUrl.trim() || null,
      username: parsed.username.trim() || null,
      isReady: parsed.isReady,
      notes: parsed.notes.trim() || null
    });

    return NextResponse.json({ ok: true, provision });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create hosting provision." },
      { status: 400 }
    );
  }
}
