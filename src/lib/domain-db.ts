import { randomUUID } from "node:crypto";
import { findMongoDocuments, findOneMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";
import type { DomainPaymentMethod } from "@/lib/domain-types";

export type DomainOrderStatus = "pending" | "paid" | "registered" | "cancelled" | "failed";

export type DomainOrderRecord = {
  _id: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  domain: string;
  years: number;
  privacyProtection: boolean;
  amount: number;
  currency: "USD";
  paymentMethod: DomainPaymentMethod;
  paymentReference: string | null;
  status: DomainOrderStatus;
  errorMessage: string | null;
  registrarReference: string | null;
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  registeredAt: string | null;
  cancelledAt: string | null;
};

export const domainCollections = {
  orders: "DomainOrders"
} as const;

export function createDomainOrderId() {
  return `domain_${randomUUID()}`;
}

export function createDomainInvoiceNumber(recordId: string) {
  return `DOM-${new Date().getUTCFullYear()}-${recordId.slice(-6).toUpperCase()}`;
}

export async function getDomainOrderById(id: string) {
  return findOneMongoDocument<DomainOrderRecord>(domainCollections.orders, { _id: id });
}

export async function getDomainOrderByPaymentReference(paymentReference: string) {
  return findMongoDocuments<DomainOrderRecord>(domainCollections.orders, { paymentReference }, { limit: 50 });
}

export async function getDomainOrders() {
  return findMongoDocuments<DomainOrderRecord>(domainCollections.orders, {}, { sort: { updatedAt: -1 }, limit: 200 });
}

export async function getDomainOrdersForUser(userId: string) {
  return findMongoDocuments<DomainOrderRecord>(domainCollections.orders, { userId }, { sort: { updatedAt: -1 }, limit: 100 });
}

export async function upsertDomainOrder(record: DomainOrderRecord) {
  await upsertMongoDocument(
    domainCollections.orders,
    { _id: record._id },
    {
      userId: record.userId,
      customerEmail: record.customerEmail,
      customerName: record.customerName,
      domain: record.domain,
      years: record.years,
      privacyProtection: record.privacyProtection,
      amount: record.amount,
      currency: record.currency,
      paymentMethod: record.paymentMethod,
      paymentReference: record.paymentReference,
      status: record.status,
      errorMessage: record.errorMessage,
      registrarReference: record.registrarReference,
      invoiceNumber: record.invoiceNumber,
      updatedAt: record.updatedAt,
      paidAt: record.paidAt,
      registeredAt: record.registeredAt,
      cancelledAt: record.cancelledAt
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}
