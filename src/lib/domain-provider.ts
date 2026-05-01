import {
  createDomainTransactionRecord,
  createManagedDomainRecord,
  getDomainTransactionByOrderId,
  getManagedDomainByOrderId,
  upsertDomainTransaction,
  upsertManagedDomain
} from "@/lib/domain-management-db";
import { type DomainOrderRecord, upsertDomainOrder } from "@/lib/domain-db";
import { type HostingProvisionRecord, upsertHostingProvision } from "@/lib/hosting-db";
import { applyDomainMarkup, registerIonosDomain } from "@/lib/ionos-domain";
import { getDomainProviderSettings } from "@/lib/platform-settings";

export async function registerDomainOrderIfNeeded(record: DomainOrderRecord) {
  const settings = await getDomainProviderSettings();
  const existingDomain = await getManagedDomainByOrderId(record._id);
  const existingTransaction = await getDomainTransactionByOrderId(record._id);

  const renewalPricing = applyDomainMarkup(record.amount / Math.max(record.years, 1), settings.renewalMarkupPercent, settings.renewalMarkupFlat);

  const managedDomain = existingDomain ?? createManagedDomainRecord({
    userId: record.userId,
    orderId: record._id,
    domain: record.domain,
    status: "pending",
    years: record.years,
    privacyProtection: record.privacyProtection,
    autoRenew: false,
    purchasePrice: record.amount,
    renewalPrice: renewalPricing.price,
    registrarReference: record.registrarReference,
    nameservers: settings.defaultNameservers,
    provider: settings.mode === "live" ? "ionos" : "manual"
  });

  const transaction = existingTransaction ?? createDomainTransactionRecord({
    userId: record.userId,
    domainId: managedDomain._id,
    orderId: record._id,
    domain: record.domain,
    type: "registration",
    amount: record.amount,
    paymentMethod: record.paymentMethod,
    paymentReference: record.paymentReference,
    registrarReference: record.registrarReference,
    metadata: {
      years: record.years,
      privacyProtection: record.privacyProtection
    },
    status: record.status === "registered" ? "active" : record.status === "failed" ? "failed" : record.status === "paid" ? "paid" : "pending"
  });

  transaction.paymentReference = record.paymentReference;
  transaction.updatedAt = new Date().toISOString();
  await upsertDomainTransaction(transaction);

  if (!settings.enabled || record.status !== "paid") {
    managedDomain.status = record.status === "registered"
      ? "active"
      : record.status === "failed"
        ? "failed"
        : record.status === "cancelled"
          ? "cancelled"
          : managedDomain.status;
    managedDomain.registrarReference = record.registrarReference;
    managedDomain.registeredAt = record.registeredAt;
    managedDomain.updatedAt = transaction.updatedAt;
    managedDomain.errorMessage = record.errorMessage;
    await upsertManagedDomain(managedDomain);
    return record;
  }

  if (!settings.autoRegisterAfterPayment || settings.mode !== "live") {
    managedDomain.status = "pending";
    managedDomain.updatedAt = transaction.updatedAt;
    await upsertManagedDomain(managedDomain);
    return record;
  }

  try {
    const registration = await registerIonosDomain({
      domain: record.domain,
      years: record.years,
      privacyProtection: record.privacyProtection,
      registrantContact: record.registrantContact,
      nameservers: managedDomain.nameservers.length > 0 ? managedDomain.nameservers : settings.defaultNameservers
    });

    const now = new Date().toISOString();

    record.status = "registered";
    record.registrarReference = registration.registrarReference;
    record.registeredAt = now;
    record.updatedAt = record.registeredAt;
    record.errorMessage = null;

    managedDomain.status = "active";
    managedDomain.registrarReference = registration.registrarReference;
    managedDomain.nameservers = registration.nameservers.length > 0 ? registration.nameservers : managedDomain.nameservers;
    managedDomain.registeredAt = now;
    managedDomain.expiresAt = registration.expiresAt;
    managedDomain.updatedAt = now;
    managedDomain.errorMessage = null;

    transaction.status = "active";
    transaction.registrarReference = registration.registrarReference;
    transaction.updatedAt = now;
    transaction.completedAt = now;
    transaction.errorMessage = null;

    await upsertDomainOrder(record);
    await upsertManagedDomain(managedDomain);
    await upsertDomainTransaction(transaction);
    return record;
  } catch (error) {
    const now = new Date().toISOString();
    record.status = "failed";
    record.errorMessage = error instanceof Error ? error.message : "Domain registration failed.";
    record.updatedAt = now;

    managedDomain.status = "failed";
    managedDomain.errorMessage = record.errorMessage;
    managedDomain.updatedAt = now;

    transaction.status = "failed";
    transaction.errorMessage = record.errorMessage;
    transaction.updatedAt = now;
    transaction.failedAt = now;

    await upsertDomainOrder(record);
    await upsertManagedDomain(managedDomain);
    await upsertDomainTransaction(transaction);
    return record;
  }
}

export async function registerHostingProvisionDomainIfNeeded(provision: HostingProvisionRecord) {
  const settings = await getDomainProviderSettings();

  if (
    !settings.enabled ||
    !settings.autoRegisterAfterPayment ||
    provision.domain.mode !== "register" ||
    !provision.domain.name ||
    provision.domain.status === "registered"
  ) {
    return provision;
  }

  if (settings.mode !== "live") {
    provision.domain.status = "pending";
    provision.domain.errorMessage = null;
    provision.updatedAt = new Date().toISOString();
    await upsertHostingProvision(provision);

    return provision;
  }

  try {
    const registration = await registerIonosDomain({
      domain: provision.domain.name,
      years: provision.domain.years,
      privacyProtection: provision.domain.privacyProtection,
      customerEmail: provision.customerEmail,
      customerName: provision.customerName,
      nameservers: settings.defaultNameservers
    });

    provision.domain.status = "registered";
    provision.domain.registrarReference = registration.registrarReference;
    provision.domain.errorMessage = null;
    provision.updatedAt = new Date().toISOString();
    await upsertHostingProvision(provision);
    return provision;
  } catch (error) {
    provision.domain.status = "failed";
    provision.domain.errorMessage = error instanceof Error ? error.message : "Domain registration failed.";
    provision.updatedAt = new Date().toISOString();
    await upsertHostingProvision(provision);
    return provision;
  }
}
