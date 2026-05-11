import { auth } from "@/auth";
import { getSocialBotDocuments } from "@/lib/social-bot-db";
import { ChatbotKnowledge } from "@/components/chatbot/chatbot-knowledge";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const documents = await getSocialBotDocuments(session.user.id);

  return <ChatbotKnowledge initialDocuments={documents} />;
}
