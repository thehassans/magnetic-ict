import { randomUUID } from "node:crypto";
import { findMongoDocuments, findOneMongoDocument, insertMongoDocument, upsertMongoDocument, deleteMongoDocuments } from "@/lib/social-bot-db";

export const portfolioCollections = {
  sites: "portfolio_sites",
  chatMessages: "portfolio_chat_messages"
} as const;

export type SocialLink = {
  platform: string;
  url: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
};

export type PortfolioExperience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
};

export type PortfolioSite = {
  _id: string;
  userId: string;
  planTier: "starter" | "professional" | "unlimited";
  name: string;
  tagline: string;
  about: string;
  phone: string;
  email: string;
  address: string;
  logoLight: string;
  logoDark: string;
  socialLinks: SocialLink[];
  customDomain: string;
  subdomain: string;
  selectedTemplate: string;
  skills: string[];
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  accentColor: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

export type PortfolioChatMessage = {
  _id: string;
  siteId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export function createPortfolioId(prefix: "pb" | "pbm") {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export async function getPortfolioSite(userId: string): Promise<PortfolioSite | null> {
  return findOneMongoDocument<PortfolioSite>(portfolioCollections.sites, { userId });
}

export async function getPortfolioSiteById(siteId: string): Promise<PortfolioSite | null> {
  return findOneMongoDocument<PortfolioSite>(portfolioCollections.sites, { _id: siteId });
}

export async function getPortfolioSiteBySubdomain(subdomain: string): Promise<PortfolioSite | null> {
  return findOneMongoDocument<PortfolioSite>(portfolioCollections.sites, { subdomain });
}

export async function getPortfolioSiteByCustomDomain(domain: string): Promise<PortfolioSite | null> {
  return findOneMongoDocument<PortfolioSite>(portfolioCollections.sites, { customDomain: domain });
}

export async function createPortfolioSite(data: Omit<PortfolioSite, "_id" | "createdAt" | "updatedAt">): Promise<PortfolioSite> {
  const now = new Date().toISOString();
  const site: PortfolioSite = {
    ...data,
    _id: createPortfolioId("pb"),
    createdAt: now,
    updatedAt: now
  };
  await insertMongoDocument(portfolioCollections.sites, site);
  return site;
}

export async function updatePortfolioSite(siteId: string, userId: string, patch: Partial<Omit<PortfolioSite, "_id" | "userId" | "createdAt">>): Promise<void> {
  await upsertMongoDocument(
    portfolioCollections.sites,
    { _id: siteId, userId },
    { ...patch, updatedAt: new Date().toISOString() }
  );
}

export async function deletePortfolioSite(siteId: string, userId: string): Promise<void> {
  await deleteMongoDocuments(portfolioCollections.sites, { _id: siteId, userId });
}

export async function getChatMessages(siteId: string, limit = 60): Promise<PortfolioChatMessage[]> {
  return findMongoDocuments<PortfolioChatMessage>(
    portfolioCollections.chatMessages,
    { siteId },
    { sort: { createdAt: 1 }, limit }
  );
}

export async function saveChatMessage(msg: Omit<PortfolioChatMessage, "_id" | "createdAt">): Promise<PortfolioChatMessage> {
  const record: PortfolioChatMessage = {
    ...msg,
    _id: createPortfolioId("pbm"),
    createdAt: new Date().toISOString()
  };
  await insertMongoDocument(portfolioCollections.chatMessages, record);
  return record;
}
