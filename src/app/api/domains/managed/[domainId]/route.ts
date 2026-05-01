import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getManagedDomainSnapshot, requestManagedDomainRenewal, updateManagedDomainAutoRenew, updateManagedDomainNameserverSet } from "@/lib/domain-management";

export async function GET(_: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const { domainId } = await params;
    const snapshot = await getManagedDomainSnapshot(session.user.id, domainId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load this domain." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  try {
    const { domainId } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: string; payload?: unknown };

    if (body.action === "nameservers") {
      const domain = await updateManagedDomainNameserverSet(session.user.id, domainId, body.payload);
      return NextResponse.json({ ok: true, domain });
    }

    if (body.action === "autoRenew") {
      const domain = await updateManagedDomainAutoRenew(session.user.id, domainId, body.payload);
      return NextResponse.json({ ok: true, domain });
    }

    if (body.action === "renew") {
      const transaction = await requestManagedDomainRenewal(session.user.id, domainId);
      return NextResponse.json({ ok: true, transaction });
    }

    return NextResponse.json({ error: "Unsupported domain management action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update this domain." }, { status: 400 });
  }
}
