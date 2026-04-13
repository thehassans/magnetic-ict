import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin(callbackPath: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/admin?callback=${encodeURIComponent(callbackPath)}`);
  }

  return session;
}
