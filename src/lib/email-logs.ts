import { randomUUID } from "node:crypto";
import { findMongoDocuments, insertMongoDocument } from "@/lib/social-bot-db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type EmailLogStatus = "sent" | "failed" | "skipped";
export type EmailLogProvider = "mailgun" | "resend" | "none";

export type EmailLogRecord = {
  _id: string;
  category: string;
  notificationKey: string | null;
  provider: EmailLogProvider;
  status: EmailLogStatus;
  to: string;
  subject: string;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export const emailLogCollections = {
  logs: "EmailLogs"
} as const;

export function createEmailLogId() {
  return `email_${randomUUID()}`;
}

export async function createEmailLog(record: Omit<EmailLogRecord, "_id" | "createdAt"> & { _id?: string; createdAt?: string }) {
  if (!hasDatabase) {
    return null;
  }

  const document: EmailLogRecord = {
    _id: record._id ?? createEmailLogId(),
    category: record.category,
    notificationKey: record.notificationKey,
    provider: record.provider,
    status: record.status,
    to: record.to,
    subject: record.subject,
    errorMessage: record.errorMessage,
    metadata: record.metadata ?? null,
    createdAt: record.createdAt ?? new Date().toISOString()
  };

  await insertMongoDocument(emailLogCollections.logs, document);
  return document;
}

export async function getEmailLogs(limit = 100) {
  if (!hasDatabase) {
    return [] as EmailLogRecord[];
  }

  return findMongoDocuments<EmailLogRecord>(emailLogCollections.logs, {}, { sort: { createdAt: -1 }, limit });
}
