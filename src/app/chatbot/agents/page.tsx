import { auth } from "@/auth";
import { getSocialBotAgents, getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotAgents } from "@/components/chatbot/chatbot-agents";

export const dynamic = "force-dynamic";

export default async function ChatbotAgentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [agents, documents] = await Promise.all([
    getSocialBotAgents(session.user.id),
    getSocialBotDocuments(session.user.id)
  ]);

  return <ChatbotAgents initialAgents={agents} initialDocuments={documents} />;
}
