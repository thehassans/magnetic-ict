import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncServiceCatalog } from "@/lib/catalog-sync";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured before syncing services." }, { status: 503 });
  }

  try {
    await syncServiceCatalog();
    return NextResponse.json({ ok: true, message: "Service catalog synced successfully." });
  } catch (error) {
    console.error("Service catalog sync failed", error);
    return NextResponse.json({ error: "Unable to sync the service catalog right now." }, { status: 500 });
  }
}
