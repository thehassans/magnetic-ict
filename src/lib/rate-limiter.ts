// In-memory token bucket rate limiter
// Keyed by `${ip}:${endpoint}`. LRU-style cleanup on every check.

type BucketEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, BucketEntry>();
const MAX_BUCKET_SIZE = 10_000; // prevent unbounded memory growth

function cleanup() {
  if (buckets.size <= MAX_BUCKET_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) buckets.delete(key);
    if (buckets.size <= MAX_BUCKET_SIZE / 2) break;
  }
}

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 *
 * @param key        Unique key (e.g. `${ip}:${pathname}`)
 * @param max        Max requests allowed within the window
 * @param windowMs   Window duration in milliseconds
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= max) {
    return false; // rate exceeded
  }

  existing.count++;
  return true;
}

/**
 * Returns remaining time (ms) until the bucket resets for a given key.
 * Returns 0 if bucket doesn't exist or has expired.
 */
export function getRateLimitRetryAfter(key: string): number {
  const existing = buckets.get(key);
  if (!existing) return 0;
  const remaining = existing.resetAt - Date.now();
  return Math.max(0, remaining);
}

/**
 * Extracts the client IP from a Next.js Request object.
 * Falls back to "unknown" if not determinable.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
