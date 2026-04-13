"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { hasConfiguredAdminCredentials } from "@/lib/admin-credentials";

export type AdminLoginState = {
  error: "invalid_credentials" | "missing_configuration" | null;
};

function normalizeCallbackPath(rawPath: string) {
  if (!rawPath || !rawPath.startsWith("/") || rawPath === "/admin") {
    return "/admin/dashboard";
  }

  return rawPath;
}

export async function authenticateAdmin(
  _previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const callbackPath = normalizeCallbackPath(
    typeof formData.get("callback") === "string" ? (formData.get("callback") as string) : "/admin/dashboard"
  );
  const email = typeof formData.get("email") === "string" ? (formData.get("email") as string).trim().toLowerCase() : "";
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";

  if (!hasConfiguredAdminCredentials()) {
    return { error: "missing_configuration" };
  }

  if (!email || !password) {
    return { error: "invalid_credentials" };
  }

  try {
    await signIn("admin-credentials", {
      email,
      password,
      redirectTo: callbackPath
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalid_credentials" };
    }

    throw error;
  }

  return { error: null };
}
