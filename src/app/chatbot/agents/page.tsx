import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotAgents, getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotAgents } from "@/components/chatbot/chatbot-agents";

export const dynamic = "force-dynamic";

export default async function ChatbotAgentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const [agents, documents] = await Promise.all([
    getSocialBotAgents(workspace.ownerId),
    getSocialBotDocuments(workspace.ownerId)
  ]);

  return <ChatbotAgents initialAgents={agents} initialDocuments={documents} />;
}
