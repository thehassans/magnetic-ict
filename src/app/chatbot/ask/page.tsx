import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotAsk } from "@/components/chatbot/chatbot-ask";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const documents = await getSocialBotDocuments(workspace.ownerId);

  return <ChatbotAsk initialDocuments={documents} />;
}
