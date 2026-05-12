import { ChatbotInbox } from "@/components/chatbot/chatbot-inbox";
import { auth } from "@/auth";
import { getSocialBotAgents, getSocialBotThreads } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

export default async function ChatbotInboxPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [threads, agents] = await Promise.all([
    getSocialBotThreads(session.user.id),
    getSocialBotAgents(session.user.id)
  ]);

  return <ChatbotInbox initialThreads={threads} initialAgents={agents} />;
}
