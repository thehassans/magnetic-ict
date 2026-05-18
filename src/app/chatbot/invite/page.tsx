import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getChatbotInvitations } from "@/lib/social-bot-db";
import { InvitePage } from "@/components/chatbot/invite-page";

export const dynamic = "force-dynamic";

function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://magnetic-ict.com"
  ).replace(/\/$/, "");
}

export default async function ChatbotInvitePage() {
  const session = await auth();
  const invitations = session?.user?.id
    ? await getChatbotInvitations(session.user.id)
    : [];

  return <InvitePage initialInvitations={invitations} appUrl={getAppUrl()} />;
}
