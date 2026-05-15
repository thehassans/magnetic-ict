import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotTest } from "@/components/chatbot/chatbot-test";

export const dynamic = "force-dynamic";

export default async function ChatbotTestPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const documents = await getSocialBotDocuments(session.user.id);

  return <ChatbotTest initialDocuments={documents} />;
}
