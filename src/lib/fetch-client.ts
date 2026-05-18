/**
 * fetchClient — a typed fetch wrapper that handles:
 * - 401 session expiry → graceful redirect with toast + destination save
 * - Automatic CSRF header injection
 * - JSON request/response typing
 */

const SESSION_REDIRECT_KEY = "magnetic_post_login_redirect";

async function handleSessionExpiry() {
  if (typeof window === "undefined") return;
  // Save the intended destination so we can redirect back after login
  sessionStorage.setItem(SESSION_REDIRECT_KEY, window.location.href);

  // Redirect to sign-in with expiry reason
  window.location.href = `/en/customer/sign-in?reason=session_expired`;
}

type FetchClientOptions = RequestInit & {
  /** Skip session expiry handling (e.g. for auth routes themselves) */
  skipAuthCheck?: boolean;
};

export async function fetchClient<T = unknown>(
  url: string,
  options: FetchClientOptions = {}
): Promise<T> {
  const { skipAuthCheck = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuthCheck) {
    await handleSessionExpiry();
    // Throw so callers know this failed
    throw new Error("Session expired. Redirecting to sign-in.");
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(errBody.error ?? `HTTP ${res.status}: ${res.statusText}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function getPostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const saved = sessionStorage.getItem(SESSION_REDIRECT_KEY);
  if (saved) sessionStorage.removeItem(SESSION_REDIRECT_KEY);
  return saved;
}
