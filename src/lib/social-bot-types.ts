export const socialChannels = ["WHATSAPP", "INSTAGRAM", "MESSENGER"] as const;
export const socialThreadModes = ["AI", "MANUAL"] as const;
export const socialMessageDirections = ["INBOUND", "OUTBOUND"] as const;
export const socialMessageRoles = ["USER", "ASSISTANT", "AGENT", "SYSTEM"] as const;
export const socialIntegrationStatuses = ["DISCONNECTED", "PENDING", "CONNECTED"] as const;
export const socialDocumentStatuses = ["PROCESSING", "READY", "FAILED"] as const;

export type SocialChannel = (typeof socialChannels)[number];
export type SocialThreadMode = (typeof socialThreadModes)[number];
export type SocialMessageDirection = (typeof socialMessageDirections)[number];
export type SocialMessageRole = (typeof socialMessageRoles)[number];
export type SocialIntegrationStatus = (typeof socialIntegrationStatuses)[number];
export type SocialDocumentStatus = (typeof socialDocumentStatuses)[number];

export type SocialBotProfile = {
  _id: string;
  userId: string;
  businessName: string;
  industry: string;
  onboardingStep: number;
  knowledgeBaseReady: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocialBotDocument = {
  _id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  status: SocialDocumentStatus;
  chunkCount: number;
  textPreview: string;
  createdAt: string;
  updatedAt: string;
};

export type SocialBotChunk = {
  _id: string;
  userId: string;
  documentId: string;
  fileName: string;
  content: string;
  embedding: number[];
  createdAt: string;
};

export type SocialBotIntegration = {
  _id: string;
  userId: string;
  channel: SocialChannel;
  enabled: boolean;
  status: SocialIntegrationStatus;
  label: string;
  pageId: string;
  phoneNumberId: string;
  accountId: string;
  accessTokenEncrypted: string;
  createdAt: string;
  updatedAt: string;
  connectedAt: string | null;
};

export type SocialBotThread = {
  _id: string;
  userId: string;
  source: SocialChannel;
  externalThreadId: string;
  contactName: string;
  contactHandle: string;
  mode: SocialThreadMode;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SocialBotMessage = {
  _id: string;
  userId: string;
  threadId: string;
  source: SocialChannel;
  direction: SocialMessageDirection;
  role: SocialMessageRole;
  text: string;
  timestamp: string;
  deliveryStatus: "PENDING" | "SENT" | "FAILED";
  metadata: Record<string, unknown>;
};

export type SocialBotWorkspace = {
  profile: SocialBotProfile | null;
  documents: SocialBotDocument[];
  integrations: SocialBotIntegration[];
  threads: SocialBotThread[];
};
