import { auth } from "@/auth";
import { getSocialBotAgents } from "@/lib/social-bot-db";
import { ChatbotAgents } from "@/components/chatbot/chatbot-agents";

export const dynamic = "force-dynamic";

export default async function ChatbotAgentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const agents = await getSocialBotAgents(session.user.id);

  return <ChatbotAgents initialAgents={agents} />;
}
