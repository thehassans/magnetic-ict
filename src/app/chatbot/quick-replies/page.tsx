import { auth } from "@/auth";
import { getSocialBotQuickReplies } from "@/lib/social-bot-db";
import { ChatbotQuickReplies } from "@/components/chatbot/chatbot-quick-replies";

export const dynamic = "force-dynamic";

export default async function QuickRepliesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const initialReplies = await getSocialBotQuickReplies(session.user.id);

  return <ChatbotQuickReplies initialReplies={initialReplies} />;
}
