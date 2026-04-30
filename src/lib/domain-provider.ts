import { type DomainOrderRecord, upsertDomainOrder } from "@/lib/domain-db";
import { getDomainProviderSettings } from "@/lib/platform-settings";

function createAuthHeaders(token: string) {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function registerDomainOrderIfNeeded(record: DomainOrderRecord) {
  const settings = await getDomainProviderSettings();

  if (!settings.enabled || !settings.autoRegisterAfterPayment || record.status !== "paid") {
    return record;
  }

  if (settings.mode !== "live" || !settings.automationEndpoint) {
    return record;
  }

  try {
    const response = await fetch(settings.automationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...createAuthHeaders(settings.automationToken)
      },
      body: JSON.stringify({
        domain: record.domain,
        years: record.years,
        privacyProtection: record.privacyProtection,
        customerEmail: record.customerEmail,
        customerName: record.customerName,
        orderId: record._id,
        providerLabel: settings.providerLabel
      })
    });

    const payload = (await response.json().catch(() => null)) as { reference?: string; error?: string } | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "Domain automation request failed.");
    }

    record.status = "registered";
    record.registrarReference = payload?.reference ?? null;
    record.registeredAt = new Date().toISOString();
    record.updatedAt = record.registeredAt;
    record.errorMessage = null;
    await upsertDomainOrder(record);
    return record;
  } catch (error) {
    record.status = "failed";
    record.errorMessage = error instanceof Error ? error.message : "Domain registration failed.";
    record.updatedAt = new Date().toISOString();
    await upsertDomainOrder(record);
    return record;
  }
}
