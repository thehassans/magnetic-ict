import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotAsk } from "@/components/chatbot/chatbot-ask";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const documents = await getSocialBotDocuments(session.user.id);

  return <ChatbotAsk documents={documents} />;
}
