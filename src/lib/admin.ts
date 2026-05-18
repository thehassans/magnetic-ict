import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin(callbackPath: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/admin?callback=${encodeURIComponent(callbackPath)}`);
  }

  return session;
}

export async function isAdminUser(email: string): Promise<boolean> {
  // Uses the same role-check as requireAdmin, but returns a boolean
  // instead of redirecting — suitable for API route guards.
  const session = await auth();
  return session?.user?.role === "ADMIN" && session.user.email === email;
}

