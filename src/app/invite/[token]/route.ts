import { redirect } from "next/navigation";
import { getChatbotInvitationByToken, updateChatbotInvitation } from "@/lib/social-bot-db";

function getAppUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://magnetic-ict.com"
  ).replace(/\/$/, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const appUrl = getAppUrl();

  if (!token) {
    redirect(`${appUrl}/en/customer/sign-in`);
  }

  const invite = await getChatbotInvitationByToken(token).catch(() => null);

  if (!invite || invite.status !== "pending") {
    redirect(`${appUrl}/en/customer/sign-in?invite_error=invalid`);
  }

  const expired = new Date(invite.expiresAt) < new Date();
  if (expired) {
    redirect(`${appUrl}/en/customer/sign-in?invite_error=expired`);
  }

  await updateChatbotInvitation(token, {
    status: "accepted",
    acceptedAt: new Date().toISOString()
  }).catch(() => null);

  const chatbotUrl = (process.env.NEXT_PUBLIC_CHATBOT_URL ?? "https://chatbot.magnetic-ict.com").replace(/\/$/, "");
  redirect(
    `${appUrl}/en/customer/sign-in` +
    `?invite=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(invite.inviteeEmail)}` +
    `&callback=${encodeURIComponent(`${chatbotUrl}/chatbot`)}`
  );
}
