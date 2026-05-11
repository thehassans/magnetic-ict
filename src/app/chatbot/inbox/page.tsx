import { ChatbotInbox } from "@/components/chatbot/chatbot-inbox";
import { auth } from "@/auth";
import { getSocialBotThreads } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

export default async function ChatbotInboxPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const threads = await getSocialBotThreads(session.user.id);

  return <ChatbotInbox initialThreads={threads} />;
}
