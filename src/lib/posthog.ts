import { PostHog } from "posthog-node";

let _posthog: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return null;

  if (!_posthog) {
    _posthog = new PostHog(apiKey, {
      host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 20,
      flushInterval: 10_000,
    });
  }
  return _posthog;
}

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: EventProps
) {
  const client = getPostHogClient();
  if (!client) return;
  client.capture({ distinctId, event, properties });
}

export function identifyUser(
  distinctId: string,
  properties: { email?: string; name?: string; plan?: string }
) {
  const client = getPostHogClient();
  if (!client) return;
  client.identify({ distinctId, properties });
}

export async function shutdownPostHog() {
  if (_posthog) await _posthog.shutdown();
}

// ── Common event names (type-safe taxonomy) ──────────────────────────────
export const AnalyticsEvents = {
  USER_SIGNUP: "user_signup",
  USER_LOGIN: "user_login",
  CHATBOT_ACCESSED: "chatbot_accessed",
  INVITE_SENT: "invite_sent",
  INVITE_ACCEPTED: "invite_accepted",
  CHANNEL_CONNECTED: "channel_connected",
  KNOWLEDGE_UPLOADED: "knowledge_uploaded",
  ORDER_PLACED: "order_placed",
  DOMAIN_SEARCHED: "domain_searched",
} as const;
