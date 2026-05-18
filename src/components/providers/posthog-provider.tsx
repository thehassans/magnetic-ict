"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useSession } from "next-auth/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

let initialized = false;

function PostHogIdentifier() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (!initialized) {
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
      initialized = true;
    }
  }, []);

  useEffect(() => {
    if (!session?.user || !POSTHOG_KEY) return;
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      posthog.identify(userId, {
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
    <PHProvider client={posthog}>
      <PostHogIdentifier />
      {children}
    </PHProvider>
  );
}

// ── Client-side event capture helper ─────────────────────────────────────
export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
