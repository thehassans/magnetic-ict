"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { CommerceProvider } from "@/components/commerce/commerce-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({
  children,
  session
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <ThemeProvider>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <CommerceProvider>{children}</CommerceProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
