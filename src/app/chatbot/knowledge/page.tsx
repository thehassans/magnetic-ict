import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotKnowledge } from "@/components/chatbot/chatbot-knowledge";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const documents = await getSocialBotDocuments(workspace.ownerId);

  return <ChatbotKnowledge initialDocuments={documents} />;
}
