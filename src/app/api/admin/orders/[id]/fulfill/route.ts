import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markOrdersFulfilled } from "@/lib/order-processing";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;

  if (!hasDatabase) {
    return NextResponse.json({ error: "Database configuration is required." }, { status: 503 });
  }

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "You do not have access to perform this action." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await markOrdersFulfilled([id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin order fulfillment failed", error);
    return NextResponse.json({ error: "Unable to fulfill this order right now." }, { status: 500 });
  }
}
