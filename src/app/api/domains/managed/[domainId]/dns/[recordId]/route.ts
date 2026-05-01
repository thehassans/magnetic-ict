import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeManagedDomainDnsRecord } from "@/lib/domain-management";

export async function DELETE(_: Request, { params }: { params: Promise<{ domainId: string; recordId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const { domainId, recordId } = await params;
    await removeManagedDomainDnsRecord(session.user.id, domainId, recordId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete DNS record." }, { status: 400 });
  }
}
