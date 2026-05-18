import { z } from "zod";

// ── String sanitizers ─────────────────────────────────────────────────────
const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHAR_RE, "")
    .trim()
    .slice(0, 10_000); // hard cap to prevent payload bombs
}

export function sanitizeEmail(input: unknown): string {
  const str = sanitizeString(input);
  return str.toLowerCase().trim();
}

// ── Reusable Zod schemas ──────────────────────────────────────────────────
export const zSafeString = z
  .string()
  .transform(sanitizeString)
  .refine((s) => s.length > 0, { message: "Field cannot be empty." });

export const zOptionalString = z
  .string()
  .optional()
  .transform((s) => (s ? sanitizeString(s) : undefined));

export const zEmail = z
  .string()
  .email({ message: "A valid email address is required." })
  .transform(sanitizeEmail);

export const zUrl = z
  .string()
  .url({ message: "A valid URL is required." })
  .transform((s) => sanitizeString(s));

export const zPositiveInt = z
  .number()
  .int()
  .positive();

// ── Parse helper (returns typed result or throws 400-able error) ───────────
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join("; ");
    throw new Error(`Validation failed: ${messages}`);
  }
  return result.data;
}

// ── Common body schemas ───────────────────────────────────────────────────
export const inviteBodySchema = z.object({
  email: zEmail,
  restrictions: z.array(z.string()).optional().default([]),
});

export const profileBodySchema = z.object({
  businessName: zSafeString.optional(),
  industry: zSafeString.optional(),
  description: zOptionalString,
});
