import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

export const dynamic = "force-dynamic";

export default async function AskMagneticRedirectPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/customer/sign-in?callback=/${locale}/dashboard/magnetic-social-bot/ask`);
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    redirect(`/${locale}/services/magneticSocialBot`);
  }

  redirect(`/${locale}/dashboard/magnetic-social-bot/ask`);
}
