import { randomUUID } from "node:crypto";
import { findMongoDocuments, findOneMongoDocument, insertMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type SupportTicketStatus = "open" | "closed";
export type SupportTicketAuthorType = "customer" | "admin";

export type SupportTicketMessage = {
  id: string;
  authorType: SupportTicketAuthorType;
  authorName: string | null;
  authorEmail: string | null;
  body: string;
  createdAt: string;
};

export type SupportTicketRecord = {
  _id: string;
  userId: string | null;
  customerEmail: string;
  customerName: string | null;
  subject: string;
  category: string | null;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messages: SupportTicketMessage[];
};

export const supportTicketCollections = {
  tickets: "SupportTickets"
} as const;

export function createSupportTicketId() {
  return `ticket_${randomUUID()}`;
}

export function createSupportTicketMessageId() {
  return `ticket_msg_${randomUUID()}`;
}

export async function getSupportTicketById(ticketId: string) {
  if (!hasDatabase) {
    return null as SupportTicketRecord | null;
  }

  return findOneMongoDocument<SupportTicketRecord>(supportTicketCollections.tickets, { _id: ticketId });
}

export async function getSupportTickets(limit = 200) {
  if (!hasDatabase) {
    return [] as SupportTicketRecord[];
  }

  return findMongoDocuments<SupportTicketRecord>(supportTicketCollections.tickets, {}, { sort: { updatedAt: -1 }, limit });
}

export async function createSupportTicket(args: {
  userId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  subject: string;
  category?: string | null;
  message: string;
}) {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL must be configured to store support tickets.");
  }

  const now = new Date().toISOString();
  const ticket: SupportTicketRecord = {
    _id: createSupportTicketId(),
    userId: args.userId ?? null,
    customerEmail: args.customerEmail.trim().toLowerCase(),
    customerName: args.customerName?.trim() || null,
    subject: args.subject.trim(),
    category: args.category?.trim() || null,
    status: "open",
    createdAt: now,
    updatedAt: now,
    closedAt: null,
    messages: [
      {
        id: createSupportTicketMessageId(),
        authorType: "customer",
        authorName: args.customerName?.trim() || null,
        authorEmail: args.customerEmail.trim().toLowerCase(),
        body: args.message.trim(),
        createdAt: now
      }
    ]
  };

  await insertMongoDocument(supportTicketCollections.tickets, ticket);
  return ticket;
}

export async function addSupportTicketReply(ticketId: string, args: {
  authorType: SupportTicketAuthorType;
  authorName?: string | null;
  authorEmail?: string | null;
  body: string;
}) {
  const ticket = await getSupportTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  const now = new Date().toISOString();
  const nextTicket: SupportTicketRecord = {
    ...ticket,
    status: "open",
    closedAt: null,
    updatedAt: now,
    messages: [
      ...ticket.messages,
      {
        id: createSupportTicketMessageId(),
        authorType: args.authorType,
        authorName: args.authorName?.trim() || null,
        authorEmail: args.authorEmail?.trim().toLowerCase() || null,
        body: args.body.trim(),
        createdAt: now
      }
    ]
  };

  await persistSupportTicket(nextTicket);
  return nextTicket;
}

export async function closeSupportTicket(ticketId: string) {
  const ticket = await getSupportTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  const now = new Date().toISOString();
  const nextTicket: SupportTicketRecord = {
    ...ticket,
    status: "closed",
    closedAt: now,
    updatedAt: now
  };

  await persistSupportTicket(nextTicket);
  return nextTicket;
}

export async function reopenSupportTicket(ticketId: string) {
  const ticket = await getSupportTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  const now = new Date().toISOString();
  const nextTicket: SupportTicketRecord = {
    ...ticket,
    status: "open",
    closedAt: null,
    updatedAt: now
  };

  await persistSupportTicket(nextTicket);
  return nextTicket;
}

async function persistSupportTicket(ticket: SupportTicketRecord) {
  await upsertMongoDocument(
    supportTicketCollections.tickets,
    { _id: ticket._id },
    {
      userId: ticket.userId,
      customerEmail: ticket.customerEmail,
      customerName: ticket.customerName,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      updatedAt: ticket.updatedAt,
      closedAt: ticket.closedAt,
      messages: ticket.messages
    },
    {
      _id: ticket._id,
      createdAt: ticket.createdAt
    }
  );

  return ticket;
}
