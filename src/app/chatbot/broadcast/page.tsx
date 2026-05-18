import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotThreads } from "@/lib/social-bot-db";
import { ChatbotBroadcast } from "@/components/chatbot/chatbot-broadcast";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const threads = await getSocialBotThreads(workspace.ownerId);

  return <ChatbotBroadcast initialThreads={threads} />;
}
