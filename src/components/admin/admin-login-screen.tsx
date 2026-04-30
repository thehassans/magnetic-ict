"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { authenticateAdmin, type AdminLoginState } from "@/app/admin/actions";
import { AdminLoginForm } from "@/components/ui/login-form";

const initialState: AdminLoginState = {
  error: null
};

export function AdminLoginScreen({
  callbackPath,
  hasConfiguredCredentials,
  showAccessDenied
}: {
  callbackPath: string;
  hasConfiguredCredentials: boolean;
  showAccessDenied: boolean;
}) {
  const t = useTranslations("Pages");
  const commerce = useTranslations("Commerce");
  const [state, formAction] = useActionState(authenticateAdmin, initialState);

  const errorMessage = !hasConfiguredCredentials
    ? t("adminAuthConfigError")
    : state.error === "invalid_credentials"
      ? t("adminAuthError")
      : state.error === "missing_configuration"
        ? t("adminAuthConfigError")
        : null;

  return (
    <AdminLoginForm
      callbackPath={callbackPath}
      action={formAction}
      submitLabel={t("adminAuthButton")}
      title={t("adminAuthTitle")}
      subtitle="Access the Magnetic operations panel through a dedicated administrator sign-in."
      emailLabel={commerce("emailPlaceholder")}
      passwordLabel={commerce("passwordPlaceholder")}
      errorMessage={errorMessage}
      accessDeniedMessage={showAccessDenied ? t("adminAccessDenied") : null}
    />
  );
}
