import { auth } from "@/auth";
import { getChatbotInvitations } from "@/lib/social-bot-db";
import { InvitePage } from "@/components/chatbot/invite-page";

export const dynamic = "force-dynamic";

export default async function ChatbotInvitePage() {
  const session = await auth();
  const invitations = session?.user?.id
    ? await getChatbotInvitations(session.user.id)
    : [];

  return <InvitePage initialInvitations={invitations} />;
}
