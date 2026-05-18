import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotTest } from "@/components/chatbot/chatbot-test";

export const dynamic = "force-dynamic";

export default async function ChatbotTestPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const documents = await getSocialBotDocuments(workspace.ownerId);

  return <ChatbotTest initialDocuments={documents} />;
}
