import { getWorkspaceContext } from "@/lib/social-bot-access";
import { ChatbotInbox } from "@/components/chatbot/chatbot-inbox";
import { auth } from "@/auth";
import { getSocialBotAgents, getSocialBotThreads } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

export default async function ChatbotInboxPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const [threads, agents] = await Promise.all([
    getSocialBotThreads(workspace.ownerId),
    getSocialBotAgents(workspace.ownerId)
  ]);

  return <ChatbotInbox initialThreads={threads} initialAgents={agents} />;
}
