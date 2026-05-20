"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type posthogType from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

let initialized = false;
let client: typeof posthogType | null = null;

function PostHogIdentifier() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (!initialized) {
      void import("posthog-js").then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: false, // manual control over what gets captured
          persistence: "localStorage",
          loaded: (ph) => {
            if (process.env.NODE_ENV === "development") ph.debug();
          },
        });
        client = posthog;
        initialized = true;
      });
    }
  }, []);

  useEffect(() => {
    if (!session?.user || !POSTHOG_KEY) return;
    const userId = (session.user as { id?: string }).id;
    if (userId && client) {
      client.identify(userId, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
    }
  }, [session]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <>
      <PostHogIdentifier />
      {children}
    </>
  );
}

// ── Client-side event capture helper ─────────────────────────────────────
export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
) {
  if (!POSTHOG_KEY) return;
  client?.capture(event, properties);
}
