import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveManagedDomainDnsRecord } from "@/lib/domain-management";
import { getDomainDnsRecords } from "@/lib/domain-management-db";

export async function GET(_: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const { domainId } = await params;
  const records = await getDomainDnsRecords(domainId, session.user.id);
  return NextResponse.json({ records });
}

export async function POST(request: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const { domainId } = await params;
    const body = await request.json();
    const record = await saveManagedDomainDnsRecord(session.user.id, domainId, body);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save DNS record." }, { status: 400 });
  }
}
