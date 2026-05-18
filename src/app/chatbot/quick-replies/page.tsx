import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotQuickReplies } from "@/lib/social-bot-db";
import { ChatbotQuickReplies } from "@/components/chatbot/chatbot-quick-replies";

export const dynamic = "force-dynamic";

export default async function QuickRepliesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const initialReplies = await getSocialBotQuickReplies(workspace.ownerId);

  return <ChatbotQuickReplies initialReplies={initialReplies} />;
}
